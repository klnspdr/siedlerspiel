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
$sql = "SELECT *, (score+$hpBonus*hp-IF(hp=0, $deathPunishment, 0)) AS final_score FROM groups";	
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
