<?php
header('Content-Type: text/html; charset=UTF-8');
include("../config/DBConfig.php");

$conn = new mysqli($servername, $username, $password);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} 

$sql="CREATE DATABASE IF NOT EXISTS ".$dbname . ";";
$result = $conn->query($sql);
if ($result === FALSE) {
	die("Database creation failed: " . $conn->error);
}

if (! $conn->select_db($dbname)){
	die("Could not connect to database: " . $conn->error);
}

$sql="CREATE TABLE IF NOT EXISTS groups(
	groupId INT AUTO_INCREMENT,
	hp INT,
	max_hp INT,
	name VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci,
	score INT DEFAULT 0,
	PRIMARY KEY (groupId)
	);";

$result = $conn->query($sql);
if ($result === FALSE) {
	die("Table creation failed: " . $conn->error);
}

$sql="CREATE TABLE IF NOT EXISTS inventory(
	groupId INT,
	item1 INT,
	item2 INT,
	item3 INT,
	item4 INT,
	item5 INT,
	item6 INT,
	item7 INT,
	item8 INT,
	item9 INT,
	item10 INT,
	item11 INT,
	item12 INT,
	item13 INT,
	item14 INT,
	item15 INT,
	item16 INT,
	item17 INT,
	item18 INT,
	item19 INT,
	item20 INT,
	PRIMARY KEY (groupId),
	CONSTRAINT FK_inventory_groupId FOREIGN KEY (groupId) references groups(groupId)
	)";
$result = $conn->query($sql);
if ($result === FALSE) {
	die("Table creation failed: " . $conn->error);
}

$sql="CREATE TABLE IF NOT EXISTS log(
	logId INT AUTO_INCREMENT,
	groupId INT,
	message TEXT CHARACTER SET utf8 COLLATE utf8_unicode_ci,
	PRIMARY KEY (logId),
	CONSTRAINT FK_log_groupId FOREIGN KEY (groupId) references groups(groupId)
	)";
$result = $conn->query($sql);
if ($result === FALSE) {
	die("Table creation failed: " . $conn->error);
}

//Create entries in tables from config file
$json_string = file_get_contents("../config/config.json");
$config = json_decode($json_string, true);
$number_groups=$config['number_groups'];
$init_hp=$config['init_values']['hp'];
$init_max_hp=$config['init_values']['max_hp'];
$groups = $config['group_names'];
foreach($groups as $init_group){
	$sql="INSERT INTO groups (hp, max_hp, name) VALUES (".
		$init_hp . ", " .
		$init_max_hp . ", " . 
		"'".$init_group."'" .
		");";
		$result = $conn->query($sql);
		if ($result === FALSE) {
			die("Creating group entry failed: " . $conn->error);
		}
}

$number_items=$config['numberItems'];
for($i=1; $i<=$number_groups; $i++){
	$sql="INSERT INTO inventory (groupId";
	for($j=1;$j<=$number_items;$j++){
		$sql .= ", item".$j;
	}
	$sql .= ") VALUES (".$i;
	for($j=1;$j<=$number_items;$j++){
		$sql .= ", ".$config['init_values']['item'.$j];
	}
	$sql .= ");";

	$result = $conn->query($sql);
	if ($result === FALSE) {
		die("Creating inventory entry failed: " . $conn->error)."\n";
	}
}

$conn->close();
?>
