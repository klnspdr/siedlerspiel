<?php 
include("../config/DBConfig.php");

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} 
if (!$conn->set_charset("utf8")) {
	echo $conn->error;
}
?>
