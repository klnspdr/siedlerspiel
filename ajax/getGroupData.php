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
$sql = "SELECT groups.groupId, hp, max_hp, name, score, GREATEST(0, (score+$hpBonus*hp-IF(hp=0, $deathPunishment, 0)";
foreach($config['finalScores']['ratios'] AS $requiredItem => $requirements) {
	$consumed_used = false;
	foreach($requirements['required_by'] AS $requiringItem => $options){
		$multiplicator = $options['multiplicator'];
		$consuming = $options['consuming'];
		$punishment = $options['punishment'];
		$once_punishment = $options['once_punishment'];
		$bonus = $options['bonus'];
		if(!is_numeric($multiplicator) || $multiplicator < 0)
			$multiplicator = 1;
		if($consuming != true)
			$consuming = false;
		if(!is_numeric($punishment) || $punishment < 0)
			$multiplicator = 0;
		if(!is_numeric($once_punishment) || $once_punishment < 0)
			$once_punishment = 0;
		if(!is_numeric($bonus) || $bonus < 0)
			$bonus = 0;
		if(!checkIsItem($requiredItem, $number_items) || !checkIsItem($requiringItem, $number_items))
			continue;
		if($consumed_used){
			$sql .= "+IF($requiredItem>=LEAST(@consumed:=(@old_consumed:=@consumed), $requiredItem)+$requiringItem/$multiplicator, $bonus, -$once_punishment-$punishment*CEILING($requiringItem/$multiplicator+LEAST(@old_consumed,$requiredItem)-$requiredItem))";
		}
		else{
			$consumed_used = true;
			$sql .= "+IF($requiredItem>=@consumed:=(@old_consumed:=0)+$requiringItem/$multiplicator, $bonus, -$once_punishment-$punishment*CEILING($requiringItem/$multiplicator+@old_consumed-$requiredItem))";
		}
	}
}
$sql .= ")) AS final_score, (SELECT displayScore FROM gameControl LIMIT 1) AS displayScore FROM groups LEFT JOIN inventory ON groups.groupId=inventory.groupId;";	
$statement = $pdo->prepare("sql");
$result = $pdo->query($sql);

if(!$result)
	echo $statement->errorInfo()[2];

if ($result->rowCount() > 0) {
    while($row = $result->fetch()) {
        $groups[] = $row;
    }
} 
else {
    echo "0 results";
}

echo json_encode($groups);


//////////////////////////////////////////////////////////////////////////
//																		//
//								Functions								//
//																		//
//////////////////////////////////////////////////////////////////////////

//Checks if $item is a valid item
function checkIsItem($item, $number_items){
	if($item == null)
		return false;
	$correctItem=false;
	for($i=0;$i<$number_items;$i++){
		if($item == "item".$i){
			$correctItem=true;
			break;
		}
	}
	return $correctItem;
}
?>
