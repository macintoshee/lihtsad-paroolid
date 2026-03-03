<?php
$file = __DIR__ . '/counter.log';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://parool.biker.ee');
$count = file_exists($file) ? (int)trim(file_get_contents($file)) : 0;
$count++;
file_put_contents($file, $count, LOCK_EX);
echo json_encode(['count' => $count]);
