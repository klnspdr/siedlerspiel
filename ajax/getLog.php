<?php
header('Content-Type: application/json;');
include("connect.php"); //establish database connection   

$logs = array();
$sql = "SELECT * FROM log ORDER BY logId";
$result = $pdo->query($sql);

if ($result->rowCount() > 0) {
    while($row = $result->fetch()) {
        $logs[] = $row;
    }
   echo json_encode($logs);
}
else {
    echo "0 results";
}
?>
