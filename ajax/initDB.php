<?php
header('Content-Type: text/html; charset=UTF-8');
include("../config/DBConfig.php");

try{
	$pdo = new PDO("mysql:host=$servername;charset=utf8", $username, $password);
}
catch (PDOException $e){
	die("Connection failed: " . $e->getMessage());
}


$dbname=str_replace("'","''",$dbname);
$sql="CREATE DATABASE IF NOT EXISTS $dbname;";
if (!$pdo->query($sql)) {
	echo($sql);
	die("Database creation failed: " . $pdo->errorInfo()[2]);
}

if ($pdo->query("USE $dbname") === false){
	die("Could not connect to database: " . $pdo->errorInfo()[2]);
}

$sql="CREATE TABLE IF NOT EXISTS groups(
	groupId INT AUTO_INCREMENT,
	hp INT,
	max_hp INT,
	name VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_unicode_ci,
	score INT DEFAULT 0,
	PRIMARY KEY (groupId)
	);";

$result = $pdo->query($sql);
if ($result === FALSE) {
	die("Table creation failed: " . $pdo->errorInfo()[2]);
}

$sql="CREATE TABLE IF NOT EXISTS inventory(
	groupId INT,
	item1 INT default 0,
	item2 INT default 0,
	item3 INT default 0,
	item4 INT default 0,
	item5 INT default 0,
	item6 INT default 0,
	item7 INT default 0,
	item8 INT default 0,
	item9 INT default 0,
	item10 INT default 0,
	item11 INT default 0,
	item12 INT default 0,
	item13 INT default 0,
	item14 INT default 0,
	item15 INT default 0,
	item16 INT default 0,
	item17 INT default 0,
	item18 INT default 0,
	item19 INT default 0,
	item20 INT default 0,
	PRIMARY KEY (groupId),
	CONSTRAINT FK_inventory_groupId FOREIGN KEY (groupId) references groups(groupId)
	)";
$result = $pdo->query($sql);
if ($result === FALSE) {
	die("Table creation failed: " . $pdo->errorInfo()[2]);
}

$sql="CREATE TABLE IF NOT EXISTS log(
	logId INT AUTO_INCREMENT,
	groupId INT,
	message TEXT CHARACTER SET utf8 COLLATE utf8_unicode_ci,
	PRIMARY KEY (logId),
	CONSTRAINT FK_log_groupId FOREIGN KEY (groupId) references groups(groupId)
	)";
$result = $pdo->query($sql);
if ($result === FALSE) {
	die("Table creation failed: " . $pdo->errorInfo()[2]);
}

$sql="CREATE TABLE IF NOT EXISTS gameControl(
	session INT AUTO_INCREMENT,
	displayScore BOOLEAN DEFAULT TRUE,
	PRIMARY KEY (session)
	);";

$result = $pdo->query($sql);
if ($result === FALSE) {
	die("Table creation failed: " . $pdo->errorInfo()[2]);
}

//Create entries in tables from config file
$json_string = file_get_contents("../config/config.json");
$config = json_decode($json_string, true);
$number_groups=$config['number_groups'];
$init_hp=$config['init_values']['hp'];
$init_max_hp=$config['init_values']['max_hp'];
$groups = $config['group_names'];

$result = $pdo->query("SELECT * FROM groups");
if($result && $result->rowCount()<$number_groups){
	foreach($groups as $init_group){
		$sql="INSERT INTO groups (hp, max_hp, name) VALUES (?, ?, ?);";
		$statement = $pdo->prepare($sql);
		if(!$statement->execute(array($init_hp, $init_max_hp, $init_group))){
			die("Creating group entry failed: " . $statement->errorInfo()[2]);
		}
	}
}

$result = $pdo->query("SELECT * FROM inventory");
if($result && $result->rowCount()<$number_groups){
	$number_items=$config['number_items'];
	$sql="INSERT INTO inventory (groupId";
	$sql2=") VALUES (?,";
	for($j=1;$j<=$number_items;$j++){
		$sql .= ", item".$j;
		$sql2 .= "?,";
	}
	$sql.=substr($sql2, 0, strlen($sql2)-1).");";
	$statement = $pdo->prepare($sql);
	for($i=1; $i<=$number_groups; $i++){
		$values = array($i);
		for($j=1;$j<=$number_items;$j++){
			//$values.append($config['init_values']['item'.$j]);
			array_push($values, $config['init_values']['item'.$j]);
		}
		if(!$statement->execute($values)){
			die("Creating inventory entry failed: " . $statement->errorInfo()[2]);
		}
	}
}

$result = $pdo->query("SELECT * FROM gameControl");
if($result && $result->rowCount() == 0){
	$sql="INSERT INTO gameControl (displayScore) VALUES (?);";
	$statement = $pdo->prepare($sql);
	if(!$statement->execute(array(true))){
		die("Creating gameControl entry failed: " . $statement->errorInfo()[2]);
	}
}


?>
