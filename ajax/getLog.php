<?php
header('Content-Type: text/html; charset=UTF-8');
include("connect.php"); //establish database connection   

$logs = array();
$sql = "SELECT * FROM log ORDER BY logId";
$result = $pdo->query($sql);

if ($result->rowCount() > 0) {
    while($row = $result->fetch()) {
        $logs[] = $row;
    }
}
else {
    echo "0 results";
}

echo json_encode($logs);
?>
