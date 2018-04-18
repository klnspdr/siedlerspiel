<?php
$shipId = $_POST["shipId"]+1;
$hp = $_POST["hp"];
$maxHP = $_POST["maxHP"];
include("../connect.php"); //establish database connection   

$newHP = min($hp + 250, $maxHP);

$sql = "UPDATE ship SET hp=$newHP WHERE id=$shipId";

if ($conn->query($sql) === TRUE) {
    echo true;
} else {
	echo $sql;
    echo $conn->error;
}

$conn->close();
?>