<?php
// Enhanced webhook.php with comprehensive logging

$logFile = __DIR__ . '/webhook.log';

function writeLog($message, $level = 'INFO') {
    global $logFile;
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[$timestamp] $level - $message" . PHP_EOL;
    file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
}

function logRequest() {
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
    $method = $_SERVER['REQUEST_METHOD'] ?? 'unknown';
    $contentType = $_SERVER['CONTENT_TYPE'] ?? 'unknown';
    $contentLength = $_SERVER['CONTENT_LENGTH'] ?? 'unknown';

    writeLog("WEBHOOK_TRIGGERED - IP: $ip, Method: $method, User-Agent: $userAgent");
    writeLog("HEADERS - Content-Type: $contentType, Content-Length: $contentLength");
}

function logPayload($payload) {
    if (isset($payload['ref'])) {
        $branch = basename($payload['ref']);
        $commit = substr($payload['after'] ?? 'unknown', 0, 8);
        $author = $payload['head_commit']['author']['name'] ?? 'unknown';
        $message = $payload['head_commit']['message'] ?? 'No message';

        writeLog("PAYLOAD_RECEIVED - Branch: $branch, Commit: $commit, Author: $author");
        writeLog("COMMIT_MESSAGE - $message");

        if (isset($payload['head_commit']['added'])) {
            $added = count($payload['head_commit']['added']);
            $modified = count($payload['head_commit']['modified']);
            $removed = count($payload['head_commit']['removed']);
            writeLog("FILES_CHANGED - Added: $added, Modified: $modified, Removed: $removed");
        }
    } else {
        writeLog("PAYLOAD_STRUCTURE - Keys: " . implode(', ', array_keys($payload)));
    }
}

function executeCommand($command, $description) {
    writeLog("COMMAND_START - $description: $command");
    $startTime = microtime(true);

    $output = [];
    $returnCode = 0;
    exec($command . ' 2>&1', $output, $returnCode);

    $duration = round((microtime(true) - $startTime) * 1000, 2);
    $outputStr = implode(' | ', $output);

    if ($returnCode === 0) {
        writeLog("COMMAND_SUCCESS - $description completed in {$duration}ms", 'SUCCESS');
        if (!empty($outputStr)) {
            writeLog("COMMAND_OUTPUT - $outputStr");
        }
    } else {
        writeLog("COMMAND_FAILED - $description failed with code $returnCode: $outputStr", 'ERROR');
    }

    return $returnCode === 0;
}

try {
    $startTime = microtime(true);

    logRequest();

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        writeLog("INVALID_METHOD - Expected POST, got " . $_SERVER['REQUEST_METHOD'], 'ERROR');
        http_response_code(405);
        exit('Method not allowed');
    }

    if (strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') === false) {
        writeLog("INVALID_CONTENT_TYPE - Expected application/json, got: " . ($_SERVER['CONTENT_TYPE'] ?? 'none'), 'ERROR');
    }

    $input = file_get_contents('php://input');
    if (substr($input, 0, 3) === "\xEF\xBB\xBF") {
        $input = substr($input, 3);
        writeLog("BOM_REMOVED - UTF-8 BOM detected and removed");
    }
    $inputLength = strlen($input);
    writeLog("RAW_INPUT - Length: $inputLength bytes");
    $inputPreview = substr($input, 0, 200);
    $inputPreview = preg_replace('/[^\x20-\x7E]/', '?', $inputPreview);
    writeLog("RAW_INPUT_PREVIEW - First 200 chars: $inputPreview");

    if (empty($input)) {
        writeLog("EMPTY_INPUT - No payload received", 'ERROR');
        http_response_code(400);
        exit('Empty payload');
    }

    $firstChar = substr($input, 0, 1);
    $lastChar = substr($input, -1);
    writeLog("JSON_BOUNDARIES - First char: '$firstChar', Last char: '$lastChar'");

    $payload = json_decode($input, true);
    $jsonError = json_last_error();
    $jsonErrorMsg = json_last_error_msg();

    if ($jsonError !== JSON_ERROR_NONE) {
        writeLog("JSON_DECODE_FAILED - Error code: $jsonError, Message: $jsonErrorMsg", 'ERROR');
        writeLog("JSON_ERROR_DETAIL - Input length: $inputLength, First 100 chars: " . substr($input, 0, 100), 'ERROR');
        $cleanInput = trim($input);
        $cleanInput = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $cleanInput);
        writeLog("RETRY_CLEAN_JSON - Attempting with cleaned input", 'INFO');
        $payload = json_decode($cleanInput, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            writeLog("CLEAN_JSON_FAILED - Still invalid after cleaning", 'ERROR');
            http_response_code(400);
            exit('Invalid JSON payload');
        } else {
            writeLog("CLEAN_JSON_SUCCESS - Parsed after cleaning", 'SUCCESS');
        }
    } else {
        writeLog("JSON_DECODE_SUCCESS - Payload parsed successfully", 'SUCCESS');
    }

    if (isset($payload['zen'])) {
        writeLog("PING_EVENT - GitHub webhook ping received");
        http_response_code(200);
        echo "pong";
        exit;
    }

    logPayload($payload);
    writeLog("DEPLOYMENT_START - Proceeding with git operations");

    $secret = 'your_webhook_secret_here';
    if (!empty($secret)) {
        $signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';
        $expectedSignature = 'sha256=' . hash_hmac('sha256', $input, $secret);

        if (!hash_equals($expectedSignature, $signature)) {
            writeLog("SIGNATURE_MISMATCH - Invalid webhook signature", 'ERROR');
            http_response_code(403);
            exit('Forbidden');
        }
        writeLog("SIGNATURE_VERIFIED - GitHub signature valid");
    }

    $repoPath = '/var/www/html/fitnesstrack';
    if (!chdir($repoPath)) {
        writeLog("CHDIR_FAILED - Cannot change to directory: $repoPath", 'ERROR');
        http_response_code(500);
        exit('Internal error');
    }
    writeLog("CHDIR_SUCCESS - Changed to repository directory: $repoPath");

    $success = true;

    if (!executeCommand('git fetch origin', 'Git fetch')) {
        $success = false;
    }

    if ($success && !executeCommand('git reset --hard origin/main', 'Git reset')) {
        $success = false;
    }

    if ($success && !executeCommand('chmod -R 755 .', 'Set permissions')) {
        $success = false;
    }

    if ($success && !executeCommand('find . -name "*.css" -o -name "*.js" | xargs touch', 'Update file timestamps')) {
        $success = false;
    }

    $totalDuration = round((microtime(true) - $startTime) * 1000, 2);

    if ($success) {
        writeLog("DEPLOYMENT_COMPLETE - Total duration: {$totalDuration}ms, Status: SUCCESS", 'SUCCESS');
        writeLog("---");

        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'message' => 'Deployment completed successfully',
            'duration' => $totalDuration . 'ms',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    } else {
        writeLog("DEPLOYMENT_FAILED - Total duration: {$totalDuration}ms, Status: FAILED", 'ERROR');
        writeLog("---");

        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Deployment failed',
            'duration' => $totalDuration . 'ms',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }

} catch (Exception $e) {
    writeLog("EXCEPTION - " . $e->getMessage(), 'ERROR');
    writeLog("---");

    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Internal server error',
        'error' => $e->getMessage()
    ]);
}
?>
