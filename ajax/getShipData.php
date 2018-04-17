<?php
//$shipId = $_GET["shipId"];
include("../connect.php"); //establish database connection   

$ships = array();
$sql = "SELECT * FROM ship";	
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $ships[] = $row;
    }
} 
else {
    echo "0 results";
}
$conn->close();

echo json_encode($ships);
?>