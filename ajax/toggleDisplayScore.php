<?php
header('Content-Type: text/html; charset=UTF-8');
include("../config/DBConfig.php");

try{
    $pdo = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8", $username, $password);
}
catch (PDOException $e){
    die("Connection failed: " . $e->getMessage());
}
$sql = "SELECT displayScore FROM gameControl WHERE session = 1";
$result = $pdo->query($sql);

if ($result->rowCount() > 0) {
    while($row = $result->fetch()) {
        $oldScore = $row['displayScore'];
    }
}
else {
    echo "0 results";
}

$newScore = $oldScore == 0 ? 1 : 0;
$statement = $pdo->prepare("UPDATE `gameControl` SET `displayScore`= ? WHERE `session` = 1; ");
if ($statement->execute(array($newScore))) {
    echo "<h1>Display Score Setting turned <br><br>" .( $newScore == 1 ? "ON" : "OFF" ). "</h1><a href='/'>Go to main Page</a>";
} else {
    echo "SQL Error <br />";
    echo $statement->queryString . "<br />";
    die($statement->errorInfo()[2]);
}
?>