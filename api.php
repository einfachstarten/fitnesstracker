<?php
$debug_mode = filter_var($_ENV['FITNESS_API_DEBUG'] ?? getenv('FITNESS_API_DEBUG'), FILTER_VALIDATE_BOOLEAN);
if ($debug_mode) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
if ($debug_mode) {
    $log_entry = date('Y-m-d H:i:s') . " - " . $_SERVER['REQUEST_METHOD'] . " " . $_SERVER['REQUEST_URI'] . "\n";
    file_put_contents(__DIR__ . '/debug.log', $log_entry, FILE_APPEND);
}

// Simple file-based storage
$data_dir = './data/';
if (!file_exists($data_dir)) {
    if (!mkdir($data_dir, 0755, true)) {
        echo json_encode(['error' => 'Cannot create data directory']);
        exit;
    }
}

// Test if we can write to data directory
if (!is_writable($data_dir)) {
    echo json_encode(['error' => 'Data directory not writable']);
    exit;
}

$request_method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

// Parse and normalize the path so the API works from any directory
$uri_path = parse_url($request_uri, PHP_URL_PATH);
$base_dir = trim(dirname($_SERVER['SCRIPT_NAME']), '/');
$script_file = basename($_SERVER['SCRIPT_NAME']);

// Remove the directory part of the script from the path
if ($base_dir !== '') {
    $uri_path = substr($uri_path, strlen('/' . $base_dir));
}

// Remove the script file itself if present
$uri_path = ltrim($uri_path, '/');
if (strpos($uri_path, $script_file) === 0) {
    $uri_path = substr($uri_path, strlen($script_file));
}

$path_parts = array_values(array_filter(explode('/', trim($uri_path, '/'))));

// Debug: Log the parsed path
if ($debug_mode) {
    file_put_contents(__DIR__ . '/debug.log', "Parsed path: " . json_encode($path_parts) . "\n", FILE_APPEND);
}

class InputValidator {
    public static function sanitize(string $value): string {
        return htmlspecialchars(strip_tags($value), ENT_QUOTES, 'UTF-8');
    }
    public static function sanitizeArray(array $arr): array {
        return array_map(function($v) { return is_string($v) ? self::sanitize($v) : $v; }, $arr);
    }
    public static function validateUser(array $input): array {
        if (!isset($input['name']) || trim($input['name']) === '') {
            throw new Exception('Name is required');
        }
        $input['name'] = self::sanitize($input['name']);
        if (isset($input['equipment']) && is_array($input['equipment'])) {
            $input['equipment'] = self::sanitizeArray($input['equipment']);
        }
        if (isset($input['goals']) && is_array($input['goals'])) {
            $input['goals'] = self::sanitizeArray($input['goals']);
        }
        return $input;
    }
}

function checkRateLimit(string $identifier, int $limit = 60, int $interval = 60) {
    $file = sys_get_temp_dir() . '/rate_' . md5($identifier);
    $data = ['count' => 0, 'time' => time()];
    if (file_exists($file)) {
        $data = json_decode(file_get_contents($file), true) ?: $data;
        if (time() - $data['time'] > $interval) {
            $data = ['count' => 0, 'time' => time()];
        }
    }
    $data['count']++;
    file_put_contents($file, json_encode($data));
    if ($data['count'] > $limit) {
        http_response_code(429);
        echo json_encode(['error' => 'Rate limit exceeded']);
        exit;
    }
}

session_start();
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(16));
}
function verifyCsrf() {
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if ($token === '') { return; }
    if (!hash_equals($_SESSION['csrf_token'], $token)) {
        http_response_code(403);
        echo json_encode(['error' => 'Invalid CSRF token']);
        exit;
    }
}

if (in_array($request_method, ['POST','PUT','DELETE'])) {
    verifyCsrf();
}
checkRateLimit($_SERVER['REMOTE_ADDR'] ?? 'cli');

// Simple routing
try {
    if ($request_method === 'GET' && empty($path_parts)) {
        // API health check
        echo json_encode([
            'status' => 'OK',
            'message' => 'Fitness Tracker API is running',
            'timestamp' => date('Y-m-d H:i:s'),
            'data_dir_writable' => is_writable($data_dir)
        ]);
        exit;
    }
    
    if ($request_method === 'POST' && isset($path_parts[0]) && $path_parts[0] === 'users') {
        if (isset($path_parts[1]) && $path_parts[1] === 'create') {
            createUser();
        } elseif (isset($path_parts[1]) && isset($path_parts[2]) && $path_parts[2] === 'plan') {
            generatePlan($path_parts[1]);
        } elseif (isset($path_parts[1]) && isset($path_parts[2]) && $path_parts[2] === 'session') {
            saveSession($path_parts[1]);
        } else {
            throw new Exception('Invalid POST route');
        }
    } elseif ($request_method === 'GET' && isset($path_parts[0]) && $path_parts[0] === 'users') {
        if (isset($path_parts[1]) && isset($path_parts[2]) && $path_parts[2] === 'plan') {
            getPlan($path_parts[1]);
        } elseif (isset($path_parts[1]) && isset($path_parts[2]) && $path_parts[2] === 'sessions') {
            getSessions($path_parts[1]);
        } elseif (isset($path_parts[1])) {
            getUser($path_parts[1]);
        } else {
            throw new Exception('Invalid GET route');
        }
    } else {
        throw new Exception("Route not found: $request_method " . implode('/', $path_parts));
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage(),
        'debug' => [
            'method' => $request_method,
            'path_parts' => $path_parts,
            'request_uri' => $request_uri
        ]
    ]);
}

function createUser() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON input: ' . json_last_error_msg());
    }
    $input = InputValidator::validateUser($input);

    $user_id = uniqid('user_');
    $user_data = [
        'id' => $user_id,
        'name' => $input['name'],
        'age' => $input['age'] ?? null,
        'experience' => $input['experience'] ?? 'beginner',
        'goals' => $input['goals'] ?? [],
        'schedule' => $input['schedule'] ?? '3days',
        'equipment' => $input['equipment'] ?? [],
        'duration' => $input['duration'] ?? '45min',
        'created_at' => date('Y-m-d H:i:s')
    ];
    
    global $data_dir;
    $user_file = $data_dir . "user_{$user_id}.json";
    
    $json_data = json_encode($user_data, JSON_PRETTY_PRINT);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('JSON encoding error: ' . json_last_error_msg());
    }
    
    if (file_put_contents($user_file, $json_data) === false) {
        throw new Exception('Failed to save user file');
    }
    
    echo json_encode([
        'id' => $user_id,
        'message' => 'User created successfully'
    ]);
}

function getUser($user_id) {
    global $data_dir;
    $user_file = $data_dir . "user_{$user_id}.json";
    
    if (!file_exists($user_file)) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        return;
    }
    
    $user_data = file_get_contents($user_file);
    if ($user_data === false) {
        throw new Exception('Failed to read user file');
    }
    
    $user = json_decode($user_data, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('JSON decode error: ' . json_last_error_msg());
    }
    
    echo json_encode($user);
}

function generatePlan($user_id) {
    global $data_dir;
    $user_file = $data_dir . "user_{$user_id}.json";
    
    if (!file_exists($user_file)) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        return;
    }
    
    $user_data = file_get_contents($user_file);
    $user = json_decode($user_data, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('User data JSON error: ' . json_last_error_msg());
    }
    
    $plan = createWorkoutPlan($user);
    
    $plan_data = [
        'user_id' => $user_id,
        'plan' => $plan,
        'created_at' => date('Y-m-d H:i:s')
    ];
    
    $plan_file = $data_dir . "plan_{$user_id}.json";
    $json_data = json_encode($plan_data, JSON_PRETTY_PRINT);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Plan JSON encoding error: ' . json_last_error_msg());
    }
    
    if (file_put_contents($plan_file, $json_data) === false) {
        throw new Exception('Failed to save plan file');
    }
    
    echo json_encode([
        'plan' => $plan,
        'message' => 'Plan generated successfully'
    ]);
}

function getPlan($user_id) {
    global $data_dir;
    $plan_file = $data_dir . "plan_{$user_id}.json";
    
    if (!file_exists($plan_file)) {
        http_response_code(404);
        echo json_encode(['error' => 'Plan not found']);
        return;
    }
    
    $plan_data = file_get_contents($plan_file);
    if ($plan_data === false) {
        throw new Exception('Failed to read plan file');
    }
    
    $plan = json_decode($plan_data, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Plan JSON decode error: ' . json_last_error_msg());
    }
    
    echo json_encode($plan);
}

function saveSession($user_id) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Session JSON input error: ' . json_last_error_msg());
    }
    
    global $data_dir;
    $sessions_file = $data_dir . "sessions_{$user_id}.json";
    
    // Load existing sessions
    $sessions = [];
    if (file_exists($sessions_file)) {
        $sessions_data = file_get_contents($sessions_file);
        if ($sessions_data !== false) {
            $sessions = json_decode($sessions_data, true) ?: [];
        }
    }
    
    // Add new session
    $session = [
        'day_index' => $input['dayIndex'],
        'completed_exercises' => $input['completedExercises'] ?? [],
        'is_completed' => $input['isCompleted'] ?? false,
        'workout_date' => $input['workoutDate'] ?? date('Y-m-d'),
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    // Update or add session
    $found = false;
    foreach ($sessions as &$existing_session) {
        if ($existing_session['day_index'] === $session['day_index'] && 
            $existing_session['workout_date'] === $session['workout_date']) {
            $existing_session = $session;
            $found = true;
            break;
        }
    }
    
    if (!$found) {
        $sessions[] = $session;
    }
    
    $json_data = json_encode($sessions, JSON_PRETTY_PRINT);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Sessions JSON encoding error: ' . json_last_error_msg());
    }
    
    if (file_put_contents($sessions_file, $json_data) === false) {
        throw new Exception('Failed to save sessions file');
    }
    
    echo json_encode(['message' => 'Session saved successfully']);
}

function getSessions($user_id) {
    global $data_dir;
    $sessions_file = $data_dir . "sessions_{$user_id}.json";
    
    if (!file_exists($sessions_file)) {
        echo json_encode([]);
        return;
    }
    
    $sessions_data = file_get_contents($sessions_file);
    if ($sessions_data === false) {
        throw new Exception('Failed to read sessions file');
    }
    
    $sessions = json_decode($sessions_data, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Sessions JSON decode error: ' . json_last_error_msg());
    }
    
    echo json_encode($sessions ?: []);
}

function createWorkoutPlan($user) {
    $experience = $user['experience'];
    $schedule = $user['schedule'];
    $equipment = $user['equipment'];
    
    // Days per week
    $days_per_week = (int)$schedule[0];
    
    // Exercise database
    $exercises = getExerciseDatabase();
    
    // Filter exercises by equipment and experience
    $available_exercises = [];
    foreach ($exercises as $category => $category_exercises) {
        $available_exercises[$category] = [];
        foreach ($category_exercises as $exercise) {
            $exercise_equipment = $exercise['equipment'];
            $has_equipment = false;
            
            foreach ($equipment as $user_equipment) {
                if (in_array($user_equipment, $exercise_equipment)) {
                    $has_equipment = true;
                    break;
                }
            }
            
            if ($has_equipment && $exercise['difficulty'] === $experience) {
                $available_exercises[$category][] = $exercise;
            }
        }
    }
    
    // Plan patterns
    $patterns = [
        3 => ['push', 'pull', 'legs'],
        4 => ['push', 'pull', 'legs', 'cardio'],
        5 => ['push', 'pull', 'legs', 'push', 'pull'],
        6 => ['push', 'pull', 'legs', 'push', 'pull', 'legs']
    ];
    
    $pattern = $patterns[$days_per_week] ?? $patterns[3];
    $plan = [];
    
    foreach ($pattern as $index => $type) {
        $day_name = "Tag " . ($index + 1);
        $day_exercises = [];
        
        if (isset($available_exercises[$type]) && !empty($available_exercises[$type])) {
            $category_exercises = $available_exercises[$type];
            shuffle($category_exercises);
            $day_exercises = array_slice($category_exercises, 0, $type === 'cardio' ? 4 : 6);
        }
        
        // If no exercises found, add bodyweight alternatives
        if (empty($day_exercises)) {
            $day_exercises = getBodyweightFallback($type);
        }
        
        $plan[$day_name] = [
            'title' => ucfirst($type) . ' Training',
            'exercises' => array_map(function($ex) use ($experience) {
                return $ex['name'] . ': ' . getRepScheme($experience);
            }, $day_exercises),
            'exercise_details' => $day_exercises,
            'duration' => getDuration($user['duration']),
            'focus' => implode(', ', array_unique(array_merge(...array_column($day_exercises, 'muscles')))),
            'difficulty' => ucfirst($experience)
        ];
    }
    
    return $plan;
}

function getBodyweightFallback($type) {
    $fallbacks = [
        'push' => [
            ['name' => 'Liegestütze', 'muscles' => ['Brust', 'Trizeps']],
            ['name' => 'Pike Push-ups', 'muscles' => ['Schultern']]
        ],
        'pull' => [
            ['name' => 'Reverse Plank', 'muscles' => ['Rücken']],
            ['name' => 'Superman', 'muscles' => ['Rücken']]
        ],
        'legs' => [
            ['name' => 'Kniebeugen', 'muscles' => ['Beine']],
            ['name' => 'Lunges', 'muscles' => ['Beine']]
        ],
        'cardio' => [
            ['name' => 'Jumping Jacks', 'muscles' => ['Cardio']],
            ['name' => 'High Knees', 'muscles' => ['Cardio']]
        ]
    ];
    
    return $fallbacks[$type] ?? $fallbacks['push'];
}

function getExerciseDatabase() {
    return [
        'push' => [
            [
                'name' => 'Liegestütze',
                'equipment' => ['bodyweight'],
                'difficulty' => 'beginner',
                'muscles' => ['Brust', 'Trizeps'],
                'instructions' => 'Klassische Liegestütze, Körper gerade halten'
            ],
            [
                'name' => 'Bankdrücken',
                'equipment' => ['barbell', 'machines'],
                'difficulty' => 'intermediate',
                'muscles' => ['Brust', 'Trizeps', 'Schultern'],
                'instructions' => 'Auf der Bank liegend, Stange zur Brust senken'
            ],
            [
                'name' => 'Kurzhantel Bankdrücken',
                'equipment' => ['dumbbells'],
                'difficulty' => 'beginner',
                'muscles' => ['Brust', 'Trizeps'],
                'instructions' => 'Mit Kurzhanteln auf der Bank'
            ]
        ],
        'pull' => [
            [
                'name' => 'Klimmzüge',
                'equipment' => ['bodyweight'],
                'difficulty' => 'intermediate',
                'muscles' => ['Rücken', 'Bizeps'],
                'instructions' => 'An der Stange hängend, Körper nach oben ziehen'
            ],
            [
                'name' => 'Latzug',
                'equipment' => ['machines'],
                'difficulty' => 'beginner',
                'muscles' => ['Rücken', 'Bizeps'],
                'instructions' => 'Stange zur Brust ziehen, aufrecht sitzen'
            ],
            [
                'name' => 'Kurzhantel Rudern',
                'equipment' => ['dumbbells'],
                'difficulty' => 'beginner',
                'muscles' => ['Rücken', 'Bizeps'],
                'instructions' => 'Vorgebeugt mit Kurzhanteln rudern'
            ]
        ],
        'legs' => [
            [
                'name' => 'Kniebeugen',
                'equipment' => ['bodyweight'],
                'difficulty' => 'beginner',
                'muscles' => ['Quadriceps', 'Gesäß'],
                'instructions' => 'Füße schulterbreit, Knie in Richtung Zehenspitzen'
            ],
            [
                'name' => 'Kreuzheben',
                'equipment' => ['barbell', 'dumbbells'],
                'difficulty' => 'intermediate',
                'muscles' => ['Rücken', 'Gesäß', 'Hamstrings'],
                'instructions' => 'Gewicht vom Boden heben, Rücken gerade'
            ],
            [
                'name' => 'Lunges',
                'equipment' => ['bodyweight', 'dumbbells'],
                'difficulty' => 'beginner',
                'muscles' => ['Quadriceps', 'Gesäß'],
                'instructions' => 'Große Schritte nach vorne'
            ]
        ],
        'cardio' => [
            [
                'name' => 'Laufband',
                'equipment' => ['cardio'],
                'difficulty' => 'beginner',
                'muscles' => ['Beine', 'Herz'],
                'instructions' => '15-20 Min moderate Intensität'
            ],
            [
                'name' => 'Jumping Jacks',
                'equipment' => ['bodyweight'],
                'difficulty' => 'beginner',
                'muscles' => ['Ganzkörper'],
                'instructions' => 'Hampelmann-Bewegung'
            ]
        ]
    ];
}

function getRepScheme($experience) {
    return match($experience) {
        'beginner' => '3 Saetze x 8-10 Wiederholungen',
        'intermediate' => '4 Saetze x 8-12 Wiederholungen',
        'advanced' => '4-5 Saetze x 6-10 Wiederholungen',
        default => '3 Saetze x 8-10 Wiederholungen'
    };
}

function getDuration($duration_input) {
    return match($duration_input) {
        '30min' => '30 Minuten',
        '45min' => '45 Minuten',
        '60min' => '60 Minuten',
        '90min' => '90 Minuten',
        default => '45 Minuten'
    };
}
?>
