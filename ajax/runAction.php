<?php
// This function returns true if the action passed could be performed and a log message could be created successfully and an error message ready to be displayed to the user otherwise.
// It takes the action (such as action1) as parameter action, the group (such as 1) as parameter groupId and the target (such as 2) as parameter targetId. Note that the first group is 1.
$groupId = $_GET["groupId"];
$action = $_GET["action"];
$targetId = $_GET["targetId"];
include("connect.php"); //establish database connection   
include("readConfig.php");
//$groupId=1;
//$targetId=2;
//$action="action2";

$number_actions=$config["number_actions"];

//check if action parameter is valid
$correctAction=false;
for($i=1;$i<=$number_actions;$i++){
	if($action == "action".$i)
		$correctAction=true;
}
if(!$correctAction){
	$conn->close();
	die("Error: Invalid action");
}
//check if groupId is valid
if($groupId <= 0 || $groupId > $number_groups){
	$conn->close();
	die("Error: Invalid group number");
}
//check if targetId is valid
if($targetId <= 0 || $targetId > $number_groups){
	$conn->close();
	die("Error: Invalid target group number");
}

$damage=$config[$action]["damage"];
$score=$config[$action]["score"];
$defendScore=$config[$action]["defendScore"];
$scorePunishment=$config[$action]["scorePunishment"];
$multiplicator=$config[$action]["multiplicator"];
$killBonus=$config[$action]["killBonus"];
$killPunishment=$config[$action]["killPunishment"];
$requirement=$config[$action]["requirement"];
$uses=$config[$action]["uses"];
$destroyItem=$config[$action]["destroyItem"];
$compareItem=$config[$action]["compareItem"];
$defense=$config[$action]["defense"];


if(!checkRequirement($groupId, $requirement, $number_items, $conn)){
	$conn->close();
	$errormsg=getRequirementErrorMessage($action, $requirement, $config);
	die($errormsg);
}
if(!useItem($groupId, $uses, $number_items, $conn)){
	$conn->close();
	$errormsg=getUsesErrorMessage($action, $uses, $config);
	die($errormsg);
}

$attackSuccess=evaluateAttackSuccess($groupId, $targetId, $compareItem, $defense, $number_items, $conn);

if($attackSuccess){
	$itemDestroyed = destroyItem($targetId, $destroyItem, $number_items, $conn);
	$kill=false;
	//it is necessary to destroy the item in order to get the score bonus. If there is no item to destroy specified, $itemDestroyed will always be true
	if($itemDestroyed){
		$mult = getMultiplicator($groupId, $multiplicator, $number_items, $conn);
		//set some default values that won't cause a change in the database if nothing has been specified in the config file
		if($damage==null)
			$damage=0;
		if($killBonus==null)
			$killBonus=0;
		if($killPunishment==null)
			$killPunishment=0;
		if($scorePunishment==null)
			$scorePunishment=0;
		if($score==null)
			$score=0;
		$sql="BEGIN;
		UPDATE groups SET hp=GREATEST((@old_hp:=hp)-$damage*$mult, 0) WHERE groupId=$targetId;
		SELECT @killing:=IF(($damage*$mult>=@old_hp) AND (@old_hp>0), true, false) AS killing from groups LIMIT 1;
		UPDATE groups SET score=score-@killing*$killPunishment-$scorePunishment WHERE groupId=$targetId;
		UPDATE groups SET score=score+@killing*$killBonus+IF(@killing, @old_hp, $score*$mult*(@old_hp>0)) WHERE groupId=$groupId;
		COMMIT;";
		$query_success = $conn->multi_query($sql);
		//get results for all query parts and display possible error messages. Also get if the target has been killed
		do{
			if($query_success){
				if($result=$conn->store_result()){
					$res_data=$result->fetch_assoc();
					$kill = $res_data['killing']!==null?$res_data['killing']:$kill;
					$result->free();
				}
			}
			else{
				echo $conn->error;
			}
			$more_results=$conn->more_results();
			$qurey_success = $conn->next_result();
		} while($more_results);
	}

	echo createLog($groupId, $targetId, $action, $attackSuccess, $itemDestroyed, $kill, $config, $conn);
}
//Attack not successfull
//give the target credit of defending himself
else{
	if($defendScore != null){
		$sql="UPDATE groups SET score=score+$defendScore WHERE groupId=$targetId;";
		if ($conn->query($sql) === FALSE) {
			echo $conn->error;
		}
	}
	echo createLog($groupId, $targetId, $action, $attackSuccess, false, false, $config, $conn);
}

$conn->close();


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

//returns true if requirement matched, false otherwise
function checkRequirement($groupId, $requirement, $number_items, $conn){
	if($requirement == null)
		return true;
	if(!checkIsItem($requirement, $number_items))
		return false;
	$sql="SELECT ".$requirement." FROM inventory WHERE groupId=".$groupId.";";
	$result=$conn->query($sql);
	if ($result == false) {
		return false;
	} else {
		if ($result->num_rows === 1) {
			$num=$result->fetch_assoc();
			return $num[$requirement] > 0;
		}
		return false;
	} 
}

//returns true if item could be used and false otherwise, eg. if none of the specified item was available
function useItem($groupId, $uses, $number_items, $conn){
	if($uses == null)
		return true;
	if(!checkIsItem($uses, $number_items))
		return false;
	$sql="UPDATE inventory SET $uses=$uses-1 WHERE groupId=$groupId AND $uses>0;";
	$result=$conn->query($sql);
	if ($result == false) {
		echo $conn->error;
		return false;
	} else {
		return $conn->affected_rows === 1;
	} 
}

//returns true if the attack was successfull. Therefore compareItem and defense are evaluated. If attacker and target are the same group, the attack is always unsuccessfull
function evaluateAttackSuccess($groupId, $targetId, $compareItem, $defense, $number_items, $conn){
	$success = false;
	if($groupId==$targetId)
		return false;

	//no need to compare in this case. Only evaluate defense if specified
	if($compareItem == null){
		$success = true;
	}
	//check if the attacking group has more of compareItem. If yes they can win
	else{
		if(!checkIsItem($compareItem, $number_items))
			return false;

		$sql="SELECT IF((SELECT $compareItem FROM inventory where groupId=$groupId)>=(SELECT $compareItem FROM inventory where groupId=$targetId), true, false) AS 'winning' FROM `inventory` LIMIT 1;";
		$result=$conn->query($sql);
		if ($result == false) {
			$success = false;
		} else {
			if ($result->num_rows === 1) {
				$winning=$result->fetch_assoc();
				$success = $winning['winning'];
			}
		} 
	}
	//if the attack was already unsuccessfull it's not necessary to evaluate defense any more
	if(!$success)
		return false;
	//take defense probability into account
	if($defense !== null){
		$defenseProbability = 0;
		$keys = array_keys($defense);
		foreach($keys as $key){
			if(!checkIsItem($key, $number_items)){
				echo("Error: invalid defense item: $key \n <br>");
				continue;
			}
			$factor = $defense[$key];
			//get the number of the specified defense item the target group has
			$sql="SELECT $key FROM inventory WHERE groupId=$targetId;";
			$result=$conn->query($sql);
			if ($result == true) {
				if ($result->num_rows === 1) {
					$num=$result->fetch_assoc();
					$defenseProbability += $factor * $num[$key];
				}
			} 
			$result->free();
		}
		if($defenseProbability == 0)
			return $success;
		//use random number to determine if attack was successfull
		if(rand(1, 100) > $defenseProbability)
			return true;
		else
			return false;
	}
	//if defense is not specified, just return the result from before
	else{
		return $success;
	}
}

//Destroys one destroyItem of the target group. If this isn't possible because the target doesn't have any of this item any more, it returns false and true if destroying it was successfull
function destroyItem($targetId, $destroyItem, $number_items, $conn){
	if($destroyItem == null)
		return true;
	if(!checkIsItem($destroyItem, $number_items))
		return false;
	
	$sql="UPDATE inventory SET $destroyItem=$destroyItem-1 WHERE groupId=$targetId AND $destroyItem>0;";
	$result=$conn->query($sql);
	if ($result == false) {
		return false;
	} else {
		return $conn->affected_rows === 1;
	} 
}

//This function gets the amount of the item specified as $multiplicator that the group with $groupId has
function getMultiplicator($groupId, $multiplicator, $number_items, $conn){
	if($multiplicator === null)
		return 1;
	if(!checkIsItem($multiplicator, $number_items))
		return 0;
	$sql="SELECT $multiplicator FROM inventory WHERE groupId=$groupId;";
	$result=$conn->query($sql);
	if ($result == false) {
		return 0;
	} else {
		if ($result->num_rows === 1) {
			$num=$result->fetch_assoc();
			return $num[$multiplicator];
		}
		return 0;
	} 
}

//This function appends a log message to the log table and returns true on success and false otherwise
function createLog($groupId, $targetId, $action, $attackSuccess, $itemDestroyed, $kill, $config, $conn){
	$msg="";
	if($attackSuccess){
		if($kill){
			$msg=$config['log_messages'][$action]['kill'];
			if($msg == null)
				$msg=$config['log_messages']['kill'];
			if($msg == null)
				$msg="Group <group> killed group <target>";
		}
		else if(!$itemDestroyed){
			$msg=$config['log_messages'][$action]['nothingToDestroy'];
			if($msg == null)
				$msg=$config['log_messages']['nothingToDestroy'];
			if($msg == null)
				$msg="Group <group> tried to perform action <action> on group <target> but found nothing to destroy";
		}
		else{
			$msg=$config['log_messages'][$action]['success'];
			if($msg == null)
				$msg=$config['log_messages']['success'];
			if($msg == null)
				$msg="Group <group> performed action <action> successfully on group <target>";
		}
	}
	else{
		if($targetId==$groupId){
			$msg=$config['log_messages'][$action]['hitSelf'];
			if($msg == null)
				$msg=$config['log_messages']['hitSelf'];
			if($msg == null)
				$msg="Group <group> tried to perform action <action> but hit themselves";
		}
		else{
			$msg=$config['log_messages'][$action]['failure'];
			if($msg == null)
				$msg=$config['log_messages']['failure'];
			if($msg == null)
				$msg="Group <group> failed performing action <action> on group <target>";
		}
	}
	$groupName=$config["group_names"]["gr$groupId"];
	if($groupName==null)
		$groupName="group $groupId";
	$targetName=$config["group_names"]["gr$targetId"];
	if($groupName==null)
		$groupName="group $targetId";
	$actionName=$config[$action]["name"];
	if($actionName==null)
		$actionName=$action;
	$msg=str_replace("<group>", $groupName, $msg);
	$msg = str_replace("<target>", $targetName, $msg);
	$msg = str_replace("<action>", $actionName, $msg);
	$msg = $conn->real_escape_string($msg);
	$sql="INSERT INTO log (groupId, message) VALUES ($groupId, '$msg');";

	$result = $conn->query($sql);
	if($result == true)
		return true;
	return $conn->error;
//	echo("groupId: $groupId <br>targetId: $targetId <br>action: $action <br>attackSuccess: $attackSuccess <br>itemDestroyed: $itemDestroyed <br>kill: $kill <br>");
}

function getRequirementErrorMessage($action, $requirement, $config){
	$msg = $config['error_messages'][$action]['action_requirement'];
	if($msg === null)
		$msg = $config['error_messages']['action_requirement'];
	if($msg === null)
		$msg = "Action <action> requires <requirement>";
	$actionName=$config[$action]["name"];
	if($actionName==null)
		$actionName=$action;
	$requirementName=$config[$requirement]['name'];
	if($requirementName === null)
		$requirementName = "item$requirement";
	$msg = str_replace("<action>", $actionName, $msg);
	$msg = str_replace("<requirement>", $requirementName, $msg);
	return $msg;
}
function getUsesErrorMessage($action, $uses, $config){
	$msg = $config['error_messages'][$action]['action_uses'];
	if($msg === null)
		$msg = $config['error_messages']['action_uses'];
	if($msg === null)
		$msg = "Action <action> requires <uses>";
	$actionName=$config[$action]["name"];
	if($actionName==null)
		$actionName=$action;
	$usesName=$config[$uses]['name'];
	if($usesName === null)
		$usesName = "item$uses";
	$msg = str_replace("<action>", $actionName, $msg);
	$msg = str_replace("<uses>", $usesName, $msg);
	return $msg;
}
?>
