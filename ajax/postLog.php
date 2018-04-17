<?php
$shipId = $_POST["shipId"];
$action = $_POST["action"];
$win = $_POST["win"];
include("../connect.php"); //establish database connection   

$sql = "INSERT INTO log (shipId, action, win)
VALUES ($shipId, '$action', $win)";

if ($conn->query($sql) === TRUE) {
    echo true;
} else {
    echo $conn->error;
}

$conn->close();
?>