<?php
// --- Konfiguration ---
$secret = 'geheimespasswort123'; // exakt wie bei GitHub eingetragen
$repoDir = '/home/.sites/689/site7951508/web/demos/fitnesstracker'; // absoluter Pfad zu deinem Git-Projekt

// --- Signature prüfen ---
$headers = getallheaders();
$hubSignature = $headers['X-Hub-Signature-256'] ?? '';

if (empty($hubSignature)) {
    http_response_code(400);
    echo 'Missing signature';
    exit;
}

$rawPost = file_get_contents('php://input');
$expected = 'sha256=' . hash_hmac('sha256', $rawPost, $secret);

if (!hash_equals($expected, $hubSignature)) {
    http_response_code(403);
    echo 'Invalid signature';
    exit;
}

// --- Git Pull ausführen ---
$output = [];
$return_var = 0;

exec("cd {$repoDir} && git pull origin main 2>&1", $output, $return_var);

if ($return_var === 0) {
    echo "OK\n" . implode("\n", $output);
} else {
    http_response_code(500);
    echo "Fehler beim git pull:\n" . implode("\n", $output);
}
?>