<?php
header('Content-Type: text/html; charset=UTF-8');
include("connect.php"); //establish database connection   

$groups = array();
$sql = "SELECT * FROM inventory ORDER BY groupId";
$result = $pdo->query($sql);

if ($result->rowCount() > 0) {
    while($row = $result->fetch()) {
        $groups[] = $row;
    }
}
else {
    echo "0 results";
}

echo json_encode($groups);
?>
