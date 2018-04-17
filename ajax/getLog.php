<?php
include("../connect.php"); //establish database connection   

$logs = array();
$sql = "SELECT * FROM log ORDER BY id";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $logs[] = $row;
    }
}
else {
    echo "0 results";
}
$conn->close();

echo json_encode($logs);
?>