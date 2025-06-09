<?php
header('Content-Type: text/html; charset=UTF-8');
// This function returns true if the action passed could be performed and a log message could be created successfully and an error message ready to be displayed to the user otherwise.
// It takes the action (such as action1) as parameter action, the group (such as 1) as parameter groupId and the target (such as 2) as parameter targetId. Note that the first group is 1.
$groupId = $_GET["groupId"];
$action = $_GET["action"];
$targetId = $_GET["targetId"];
include("connect.php"); //establish database connection   
include("readConfig.php");
//$groupId=1;
//$targetId=2;
//$action="action1";

$number_actions=$config["number_actions"];

//check if action parameter is valid
$correctAction=false;
for($i=1;$i<=$number_actions;$i++){
	if($action == "action".$i)
		$correctAction=true;
}
if(!$correctAction){
	die("Error: Invalid action");
}
//check if groupId is valid
if($groupId <= 0 || $groupId > $number_groups){
	die("Error: Invalid group number");
}
//check if targetId is valid
if($targetId <= 0 || $targetId > $number_groups){
	die("Error: Invalid target group number");
}

$damage = $config[$action]["damage"] ?? null;
$score = $config[$action]["score"] ?? null;
$defendScore = $config[$action]["defendScore"] ?? null;
$scorePunishment = $config[$action]["scorePunishment"] ?? null;
$multiplicator = $config[$action]["multiplicator"] ?? null;
$killBonus = $config[$action]["killBonus"] ?? null;
$killPunishment = $config[$action]["killPunishment"] ?? null;
$requirement = $config[$action]["requirement"] ?? null;
$uses = $config[$action]["uses"] ?? null;
$destroyItem = $config[$action]["destroyItem"] ?? null;
$compareItem = $config[$action]["compareItem"] ?? null;
$defense = $config[$action]["defense"] ?? null;
$deadAllowed = $config[$action]['deadAllowed'] ?? false;

//check if group is dead and if they are allowed to buy the item being dead
if($deadAllowed == false && !getIsAlive($groupId, $pdo)){
	$errormsg=getDeathErrorMessage($action, $config);
	die($errormsg);
}

if(!checkRequirement($groupId, $requirement, $number_items, $pdo)){
	$errormsg=getRequirementErrorMessage($action, $requirement, $config);
	die($errormsg);
}
if(!useItem($groupId, $uses, $number_items, $pdo)){
	$errormsg=getUsesErrorMessage($action, $uses, $config);
	die($errormsg);
}

$attackSuccess=evaluateAttackSuccess($groupId, $targetId, $compareItem, $defense, $number_items, $pdo);

if($attackSuccess){
	$itemDestroyed = destroyItem($targetId, $destroyItem, $number_items, $pdo);
	$kill=false;
	//it is necessary to destroy the item in order to get the score bonus. If there is no item to destroy specified, $itemDestroyed will always be true
	if($itemDestroyed){
		$mult = getMultiplicator($groupId, $multiplicator, $number_items, $pdo);
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
//		$sql="BEGIN;
//		UPDATE groups SET hp=GREATEST((@old_hp:=hp)-$damage*$mult, 0) WHERE groupId=$targetId;
//		SELECT @killing:=IF(($damage*$mult>=@old_hp) AND (@old_hp>0), true, false) AS killing from groups LIMIT 1;
//		UPDATE groups SET score=score-@killing*$killPunishment-$scorePunishment WHERE groupId=$targetId;
//		UPDATE groups SET score=score+@killing*$killBonus+IF(@killing, @old_hp, $score*$mult*(@old_hp>0)) WHERE groupId=$groupId;
//		COMMIT;";
		$sql="BEGIN;
		UPDATE groups SET hp=GREATEST((@old_hp:=hp)-:damage*:mult, 0) WHERE groupId=:targetId;
		SELECT @killing:=IF((:damage*:mult>=@old_hp) AND (@old_hp>0), true, false) AS killing from groups LIMIT 1;
		UPDATE groups SET score=GREATEST(0, score-@killing*:killPunishment-:scorePunishment) WHERE groupId=:targetId;
		UPDATE groups SET score=score+@killing*:killBonus+IF(@killing, @old_hp, :score*:mult*(@old_hp>0)) WHERE groupId=:groupId;
		COMMIT;";
		$statement = $pdo->prepare($sql);
		$query_success = $statement->execute(array(':damage'=>$damage, ':mult'=>$mult, ':targetId'=>$targetId, ':killPunishment'=>$killPunishment, ':scorePunishment'=>$scorePunishment, ':killBonus'=>$killBonus, ':score'=>$score, ':groupId'=>$groupId));
		//$query_success = $conn->multi_query($sql);
		//get results for all query parts and display possible error messages. Also get if the target has been killed
		do {
			if($statement->errorCode() != "00000"){
				echo $statement->errorInfo()[2];
				continue;
			}
			$rowset=$statement->fetch();
			if($rowset)
				$kill = $rowset['killing']!==null?$rowset['killing']:$kill;
		}while ($statement->nextRowset());

//		do{
//			if($query_success){
//				if($result=$conn->store_result()){
//					$res_data=$result->fetch_assoc();
//					$kill = $res_data['killing']!==null?$res_data['killing']:$kill;
//					$result->free();
//				}
//			}
//			else{
//				echo $conn->error;
//			}
//			$more_results=$conn->more_results();
//			$qurey_success = $conn->next_result();
//		} while($more_results);
	}

	echo createLog($groupId, $targetId, $action, $attackSuccess, $itemDestroyed, $kill, $config, $pdo);
}
//Attack not successfull
//give the target credit of defending himself
else{
	if($defendScore != null){
		$sql="UPDATE groups SET score=score+? WHERE groupId=?;";
		$statement = $pdo->prepare($sql);
		if(!$statement->execute(array($defendScore, $targetId)))
			echo $statement->errorInfo()[2];
	}
	echo createLog($groupId, $targetId, $action, $attackSuccess, false, false, $config, $pdo);
}



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
function checkRequirement($groupId, $requirement, $number_items, $pdo){
	if($requirement == null)
		return true;
	if(!checkIsItem($requirement, $number_items))
		return false;
	$safeRequirement = str_replace('`', '', $requirement);
	$sql="SELECT `$safeRequirement` FROM inventory WHERE groupId=?;";
	$statement = $pdo->prepare($sql);
	if($statement->execute(array($groupId)))
		return $statement->fetch()[$requirement] > 0;
	return false;
//	$result=$conn->query($sql);
//	if ($result == false) {
//		return false;
//	} else {
//		if ($result->num_rows === 1) {
//			$num=$result->fetch_assoc();
//			return $num[$requirement] > 0;
//		}
//		return false;
//	} 
}

//returns true if item could be used and false otherwise, eg. if none of the specified item was available
function useItem($groupId, $uses, $number_items, $pdo){
	if($uses == null)
		return true;
	if(!checkIsItem($uses, $number_items))
		return false;
	$safeUses = str_replace('`', '', $uses);
	$sql="UPDATE inventory SET `$safeUses`=`$safeUses`-1 WHERE groupId=? AND `$safeUses`>0;";
	$statement = $pdo->prepare($sql);
	if($statement->execute(array($groupId)))
		return $statement->rowCount() === 1;
	return false;
//	$result=$conn->query($sql);
//	if ($result == false) {
//		echo $conn->error;
//		return false;
//	} else {
//		return $conn->affected_rows === 1;
//	} 
}

//returns true if the attack was successfull. Therefore compareItem and defense are evaluated. If attacker and target are the same group, the attack is always unsuccessfull
function evaluateAttackSuccess($groupId, $targetId, $compareItem, $defense, $number_items, $pdo){
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

		//$sql="SELECT IF((SELECT $compareItem FROM inventory where groupId=$groupId)>=(SELECT $compareItem FROM inventory where groupId=$targetId), true, false) AS 'winning' FROM `inventory` LIMIT 1;";
		$safeCompareItem = str_replace('`', '', $compareItem);
		$sql="SELECT IF((SELECT $safeCompareItem FROM inventory where groupId=:groupId)>=(SELECT $safeCompareItem FROM inventory where groupId=:targetId), true, false) AS 'winning' FROM `inventory` LIMIT 1;";
		$statement = $pdo->prepare($sql);
		if($statement->execute(array(':groupId'=>$groupId, ':targetId'=>$targetId))){
			$success = $statement->fetch()['winning'];
		}
		else{
			$success = false;
		}
//		$result=$conn->query($sql);
//		if ($result == false) {
//			$success = false;
//		} else {
//			if ($result->num_rows === 1) {
//				$winning=$result->fetch_assoc();
//				$success = $winning['winning'];
//			}
//		} 
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
			$sql="SELECT $key FROM inventory WHERE groupId=?;";
			$statement = $pdo->prepare($sql);
			if($statement->execute(array($targetId)))
				$defenseProbability += $factor * $statement->fetch()[$key];
//			$result=$conn->query($sql);
//			if ($result == true) {
//				if ($result->num_rows === 1) {
//					$num=$result->fetch_assoc();
//					$defenseProbability += $factor * $num[$key];
//				}
//			} 
//			$result->free();
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
function destroyItem($targetId, $destroyItem, $number_items, $pdo){
	if($destroyItem == null)
		return true;
	if(!checkIsItem($destroyItem, $number_items))
		return false;
	
	$sql="UPDATE inventory SET $destroyItem=$destroyItem-1 WHERE groupId=? AND $destroyItem>0;";
	$statement = $pdo->prepare($sql);
	if($statement->execute(array($targetId)))
		return $statement->rowCount() === 1;
	return false;

//	$result=$conn->query($sql);
//	if ($result == false) {
//		return false;
//	} else {
//		return $conn->affected_rows === 1;
//	} 
}

//This function gets the amount of the item specified as $multiplicator that the group with $groupId has
function getMultiplicator($groupId, $multiplicator, $number_items, $pdo){
	if($multiplicator === null)
		return 1;
	if(!checkIsItem($multiplicator, $number_items))
		return 0;
	$sql="SELECT $multiplicator FROM inventory WHERE groupId=?;";
	$statement = $pdo->prepare($sql);
	if($statement->execute(array($groupId))){
		if($statement->rowCount() === 1)
			return $statement->fetch()[$multiplicator];
	}
	return 0;
//	$result=$conn->query($sql);
//	if ($result == false) {
//		return 0;
//	} else {
//		if ($result->num_rows === 1) {
//			$num=$result->fetch_assoc();
//			return $num[$multiplicator];
//		}
//		return 0;
//	} 
}

function getIsAlive($groupId, $pdo){
	$sql="SELECT hp FROM groups WHERE groupId=?;";
	$statement = $pdo->prepare($sql);
	if($statement->execute(array($groupId)))
		return $statement->fetch()['hp'] > 0;
	return false;
//	$result=$conn->query($sql);
//	if ($result == false) {
//		return false;
//	} else {
//		if ($result->num_rows === 1) {
//			$resArray=$result->fetch_assoc();
//			return $resArray['hp'] > 0;
//		}
//		return false;
//	} 

}

//This function appends a log message to the log table and returns true on success and false otherwise
function createLog($groupId, $targetId, $action, $attackSuccess, $itemDestroyed, $kill, $config, $pdo){
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
		else {
			$msg = $config['log_messages'][$action]['failure'];
			if ($msg == null)
				$msg = $config['log_messages']['failure'];
			if ($msg == null)
				$msg = "Group <group> failed performing action <action> on group <target>";
		}

		//defend response
		$defendResponse = "";
		$defendResponse = $config['error_messages'][$action]['action_defend'];
		if($defendResponse === null)
			$defendResponse = $config['error_messages']['action_defend'];
		if($defendResponse === null)
			$defendResponse = "Action <action> was defended by <target>";
		$actionName=$config[$action]["name"];
		if($actionName==null)
			$actionName=$action;
		$targetName=$config["group_names"]["gr$targetId"];
		$defendResponse = str_replace("<action>", $actionName, $defendResponse);
		$defendResponse = str_replace("<target>", $targetName, $defendResponse);

		echo $defendResponse;

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
	$sql="INSERT INTO log (groupId, message) VALUES (?, ?);";

	$statement = $pdo->prepare($sql);
	if($statement->execute(array($groupId, $msg)))
		return true;
	return $statement->errorInfo()[2];
//	$result = $conn->query($sql);
//	if($result == true)
//		return true;
//	return $conn->error;
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

function getDeathErrorMessage($action, $config){
	$errormsg=$config["error_messages"][$action]["action_death"];
	if($errormsg == null)
		$errormsg=$config["error_messages"]["action_death"];
	if($errormsg == null)
		$errormsg = "You have to be alive to perform action <action>";
	$itemName=$config[$action]["name"];
	if($actionName==null)
		$actionName=$action;

	$errormsg=str_replace("<action>", $actionName, $errormsg);
	return $errormsg;
}
?>
