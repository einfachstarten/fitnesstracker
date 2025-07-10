<?php
// api.php - Simple PHP API for fitness tracker
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Simple file-based storage
$data_dir = './data/';
if (!file_exists($data_dir)) {
    mkdir($data_dir, 0755, true);
}

$request_method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path_parts = explode('/', trim($path, '/'));

// Remove 'api.php' from path if present
if (end($path_parts) === 'api.php') {
    array_pop($path_parts);
}

// Route handling
try {
    switch ($request_method) {
        case 'POST':
            if (isset($path_parts[0]) && $path_parts[0] === 'users') {
                if (isset($path_parts[1]) && $path_parts[1] === 'create') {
                    createUser();
                } elseif (isset($path_parts[1]) && isset($path_parts[2]) && $path_parts[2] === 'plan') {
                    generatePlan($path_parts[1]);
                } elseif (isset($path_parts[1]) && isset($path_parts[2]) && $path_parts[2] === 'session') {
                    saveSession($path_parts[1]);
                }
            }
            break;
            
        case 'GET':
            if (isset($path_parts[0]) && $path_parts[0] === 'users') {
                if (isset($path_parts[1]) && isset($path_parts[2]) && $path_parts[2] === 'plan') {
                    getPlan($path_parts[1]);
                } elseif (isset($path_parts[1]) && isset($path_parts[2]) && $path_parts[2] === 'sessions') {
                    getSessions($path_parts[1]);
                } elseif (isset($path_parts[1])) {
                    getUser($path_parts[1]);
                }
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

function createUser() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Name is required']);
        return;
    }
    
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
    
    if (file_put_contents($user_file, json_encode($user_data, JSON_PRETTY_PRINT))) {
        echo json_encode([
            'id' => $user_id,
            'message' => 'User created successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create user']);
    }
}

function getUser($user_id) {
    global $data_dir;
    $user_file = $data_dir . "user_{$user_id}.json";
    
    if (file_exists($user_file)) {
        $user_data = json_decode(file_get_contents($user_file), true);
        echo json_encode($user_data);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
    }
}

function generatePlan($user_id) {
    global $data_dir;
    $user_file = $data_dir . "user_{$user_id}.json";
    
    if (!file_exists($user_file)) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        return;
    }
    
    $user = json_decode(file_get_contents($user_file), true);
    $plan = createWorkoutPlan($user);
    
    $plan_data = [
        'user_id' => $user_id,
        'plan' => $plan,
        'created_at' => date('Y-m-d H:i:s')
    ];
    
    $plan_file = $data_dir . "plan_{$user_id}.json";
    
    if (file_put_contents($plan_file, json_encode($plan_data, JSON_PRETTY_PRINT))) {
        echo json_encode([
            'plan' => $plan,
            'message' => 'Plan generated successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to generate plan']);
    }
}

function getPlan($user_id) {
    global $data_dir;
    $plan_file = $data_dir . "plan_{$user_id}.json";
    
    if (file_exists($plan_file)) {
        $plan_data = json_decode(file_get_contents($plan_file), true);
        echo json_encode($plan_data);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Plan not found']);
    }
}

function saveSession($user_id) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    global $data_dir;
    $sessions_file = $data_dir . "sessions_{$user_id}.json";
    
    // Load existing sessions
    $sessions = [];
    if (file_exists($sessions_file)) {
        $sessions = json_decode(file_get_contents($sessions_file), true) ?: [];
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
    
    if (file_put_contents($sessions_file, json_encode($sessions, JSON_PRETTY_PRINT))) {
        echo json_encode(['message' => 'Session saved successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save session']);
    }
}

function getSessions($user_id) {
    global $data_dir;
    $sessions_file = $data_dir . "sessions_{$user_id}.json";
    
    if (file_exists($sessions_file)) {
        $sessions = json_decode(file_get_contents($sessions_file), true);
        echo json_encode($sessions ?: []);
    } else {
        echo json_encode([]);
    }
}

function createWorkoutPlan($user) {
    $experience = $user['experience'];
    $schedule = $user['schedule'];
    $equipment = $user['equipment'];
    $goals = $user['goals'];
    
    // Days per week
    $days_per_week = (int)$schedule[0]; // Extract number from "3days", "4days", etc.
    
    // Exercise database
    $exercises = getExerciseDatabase();
    
    // Filter exercises by equipment
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
        
        if (isset($available_exercises[$type])) {
            $category_exercises = $available_exercises[$type];
            shuffle($category_exercises);
            $day_exercises = array_slice($category_exercises, 0, $type === 'cardio' ? 4 : 6);
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
                'name' => 'Fahrrad-Ergometer',
                'equipment' => ['cardio'],
                'difficulty' => 'beginner',
                'muscles' => ['Beine', 'Herz'],
                'instructions' => '15-20 Min verschiedene Programme'
            ]
        ]
    ];
}

function getRepScheme($experience) {
    $schemes = [
        'beginner' => '2x8-10',
        'intermediate' => '3x8-12',
        'advanced' => '3x10-15'
    ];
    return $schemes[$experience] ?? $schemes['beginner'];
}

function getDuration($duration) {
    $durations = [
        '30min' => '30 Min',
        '45min' => '45 Min',
        '60min' => '60 Min',
        '90min' => '90+ Min'
    ];
    return $durations[$duration] ?? '45 Min';
}
?>