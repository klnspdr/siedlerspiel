<?php 
include("../config/DBConfig.php");

//create PDO
$pdo = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8", $username, $password);
?>
