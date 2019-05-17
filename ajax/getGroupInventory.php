<?php
header('Content-Type: text/html; charset=UTF-8');
include("connect.php"); //establish database connection   

$groups = array();
$sql = "SELECT * FROM inventory ORDER BY groupId";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $groups[] = $row;
    }
}
else {
    echo "0 results";
}
$conn->close();

echo json_encode($groups);
?>
