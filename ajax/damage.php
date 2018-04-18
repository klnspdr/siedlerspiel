<?php
$shipId = $_POST["shipId"]+1;
$damage = $_POST["damage"];
include("../connect.php"); //establish database connection   

$sql = "UPDATE ship SET hp=hp-$damage WHERE id=$shipId";

if ($conn->query($sql) === TRUE) {
    echo true;
} else {
    echo $conn->error;
}

$conn->close();
?>