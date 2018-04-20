<?php
include("../connect.php"); //establish database connection   

$ships = array();
$sql = "SELECT shipId, fass AS Faesser, zwieback AS Schiffszwieback, haengematte AS Haengematten, segel AS Segel, kanone AS Kanonen, kanonenkugel AS Kanonenkugeln, ruder AS Ruder, ruderupgrade AS Ruderupgrade, schiffswandverstaerkung AS Schiffswandverstaerkung, enterhaken AS Enterhaken, waffen AS Waffen, strickleiter AS Strickleiter, gallionsfigur AS Gallionsfigur, schiffsorgel AS Schiffsorgel, schatz AS Schatz FROM inventory ORDER BY id";
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