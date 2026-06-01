<?php
include("connect.php");

$sql="DROP TABLE IF EXISTS log";
$result = $pdo->query($sql);
if ($result === FALSE) {
	die("Could not delete table: " . $pdo->errorInfo()[2]);
}

$sql="DROP TABLE IF EXISTS inventory";
$result = $pdo->query($sql);
if ($result === FALSE) {
	die("Could not delete table: " . $pdo->errorInfo()[2]);
}

$sql="DROP TABLE IF EXISTS groups";
$result = $pdo->query($sql);
if ($result === FALSE) {
	die("Could not delete table: " . $pdo->errorInfo()[2]);
}

$sql="DROP TABLE IF EXISTS gameControl";
$result = $pdo->query($sql);
if ($result === FALSE) {
	die("Could not delete table: " . $pdo->errorInfo()[2]);
}

echo "<h1>Database cleared</h1><p><a href='/'>Go to main Page</a></p><p><a href='/ajax/initDB.php'>Initialize Database</a></p>";


?>
