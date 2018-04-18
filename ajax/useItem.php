<?php
$shipId = $_POST["shipId"]+1;
$item = $_POST["item"];
include("../connect.php"); //establish database connection   


$sql = "UPDATE inventory SET $item=$item-1 WHERE shipId=$shipId";

if ($conn->query($sql) === TRUE) {
    echo true;
} else {
    echo $conn->error;
}

$conn->close();
?>