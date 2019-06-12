<?php
header('Content-Type: text/html; charset=UTF-8');
include("connect.php"); //establish database connection   
include("readConfig.php");

$hpBonus = $config['finalScores']['hp'];
$deathPunishment = $config['finalScores']['deathPunishment'];
if($hpBonus == null)
	$hpBonus = 0;
if($deathPunishment == null)
	$deathPunishment = 0;

$groups = array();
$sql = "SELECT *, GREATEST(0, (score+$hpBonus*hp-IF(hp=0, $deathPunishment, 0))) AS final_score FROM groups";	
$statement = $pdo->prepare("sql");
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
