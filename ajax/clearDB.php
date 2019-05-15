<?php
include("connect.php");

$sql="DROP TABLE IF EXISTS log";
$result = $conn->query($sql);
if ($result === FALSE) {
	die("Could not delete table: " . $conn->error);
}

$sql="DROP TABLE IF EXISTS inventory";
$result = $conn->query($sql);
if ($result === FALSE) {
	die("Could not delete table: " . $conn->error);
}

$sql="DROP TABLE IF EXISTS groups";
$result = $conn->query($sql);
if ($result === FALSE) {
	die("Could not delete table: " . $conn->error);
}

?>
