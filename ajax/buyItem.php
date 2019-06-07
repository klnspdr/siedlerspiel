<?php
header('Content-Type: text/html; charset=UTF-8');
// This function returns true if the item passed could be bought and a log message could be created successfully and an error message ready to be displayed to the user otherwise.
// It takes the item (such as item1) as parameter item and the group (such as 1) as parameter groupId. Note that the first group is 1.
$groupId = $_GET["groupId"];
$item = $_GET["item"];
include("connect.php"); //establish database connection   
include("readConfig.php");

//check if item parameter is valid
$correctItem=false;
for($i=1;$i<=$number_items;$i++){
	if($item == "item".$i)
		$correctItem=true;
}
if(!$correctItem){
	die("Error: Invalid item: ".$item);
}
//check if groupId is valid
if($groupId <= 0 || $groupId > $number_groups){
	die("Error: Invalid group number: ".$groupId);
}


$plusMaxHP=$config[$item]["plusMaxHP"];
$plusHP=$config[$item]["plusHP"];
$max=$config[$item]["max"];
$requirement=$config[$item]["requirement"];
$score=$config[$item]["score"];

//check if group is dead and if they are allowed to buy the item being dead
if($config[$item]['deadAllowed']==false && !getIsAlive($groupId, $pdo)){
	$errormsg=getDeathErrorMessage($item, $config);
	die($errormsg);
}

//check if the maximum amount of items allowed is reached already
if(!checkMax($groupId, $item, $max, $pdo)){
	$errormsg=getMaxErrorMessage($item, $max, $config);
	die($errormsg);
}
if(!checkRequirement($groupId, $requirement, $number_items, $pdo)){
	$errormsg=getRequirementErrorMessage($item, $requirement, $config);
	die($errormsg);
}


if($plusMaxHP == null)
	$plusMaxHP = 0;
if($plusHP == null)
	$plusHP = 0;
if($score == null)
	$score = 0;
$sqlItem=str_replace('`', '', $item);
$sql="UPDATE inventory, groups SET `$sqlItem`=`$sqlItem`+1, groups.max_hp=groups.max_hp+:plusMaxHP, groups.hp=groups.hp+:plusHP, groups.score=groups.score+:score WHERE inventory.groupId=:groupId AND groups.groupId=:groupId;";
$statement = $pdo->prepare($sql);
if($statement->execute(array(':plusMaxHP'=>$plusMaxHP, 'plusHP'=>$plusHP, ':score'=>$score, ':groupId'=>$groupId))){
	echo createLog($groupId, $item, $config, $pdo);
}
else {
	echo $statement->errorInfo()[2];
}


//////////////////////////////////////////////////////////////////////////
//																		//
//								Functions								//
//																		//
//////////////////////////////////////////////////////////////////////////

//returns true if requirement matched, false otherwise
function checkRequirement($groupId, $requirement, $number_items, $pdo){
	if($requirement == null)
		return true;
	$correctItem=false;
	for($i=0;$i<$number_items;$i++){
		if($requirement == "item".$i)
			$correctItem=true;
	}
	if(!$correctItem)
		return false;
	$requirement = str_replace('`', '', $requirement);
	$statement = $pdo->prepare("SELECT `$requirement` FROM inventory WHERE groupId=?;");
	if($statement->execute(array($groupId))){
		if($statement->rowCount() === 1){
			return $statement->fetch()[$requirement] > 0;
		}
		return false;
	}
	else{
		return false;
	}
}

//returns true if max not reached yet, meaning that it is possible to buy the item
function checkMax($groupId, $item, $max, $pdo){
	if($max === null)
		return true;
	if($max <= 0)
		return false;
	$item = str_replace('`', '', $item);
	$statement = $pdo->prepare("SELECT `$item` FROM inventory WHERE groupId=?;");
	if($statement->execute(array($groupId))){
		if($statement->rowCount() === 1)
			return $statement->fetch()[$item] < $max;
	}
	return false;
}

function getIsAlive($groupId, $pdo){
	$sql="SELECT hp FROM groups WHERE groupId=?;";
	$statement = $pdo->prepare($sql);
	if($statement->execute(array($groupId))){
		if($statement->rowCount() === 1){
			return $statement->fetch()['hp'] > 0;
		}
	}
	return false;
}

function getRequirementErrorMessage($item, $requirement, $config){
	$errormsg=$config["error_messages"][$item]["requirement"];
	if($errormsg == null)
		$errormsg=$config["error_messages"]["requirement"];
	if($errormsg == null)
		$errormsg = "You have to buy <requirement> before you can buy <item>.";
	$itemName=$config[$item]["name"];
	if($itemName==null)
		$itemName=$item;
	$requirementName=$config[$requirement]["name"];
	if($requirementName==null)
		$requirementName=$requirement;
	$errormsg=str_replace("<item>", $itemName, $errormsg);
	return str_replace("<requirement>", $requirementName, $errormsg);
}

function getMaxErrorMessage($item, $max, $config){
	$errormsg=$config["error_messages"][$item]["max"];
	if($errormsg == null)
		$errormsg=$config["error_messages"]["max"];
	if($errormsg == null)
		$errormsg = "You can buy at most <max> <item>";
	$itemName=$config[$item]["name"];
	if($itemName==null)
		$itemName=$item;

	$errormsg=str_replace("<item>", $itemName, $errormsg);
	return str_replace("<max>", $max, $errormsg);
}

function getDeathErrorMessage($item, $config){
	$errormsg=$config["error_messages"][$item]["death"];
	if($errormsg == null)
		$errormsg=$config["error_messages"]["death"];
	if($errormsg == null)
		$errormsg = "You have to be alive to buy <item>";
	$itemName=$config[$item]["name"];
	if($itemName==null)
		$itemName=$item;

	$errormsg=str_replace("<item>", $itemName, $errormsg);
	return $errormsg;
}

//This function appends a message to the log in the DB. It returns true on success and false otherwise
function createLog($groupId, $item, $config, $pdo){
	$logmsg=$config["log_messages"][$item]["buy"];
	if($logmsg==null)
		$logmsg=$config["log_messages"]["buy"];
	if($logmsg==null)
		$logmsg="Group <group> has bought <item>.";
	$itemName=$config[$item]["name"];
	if($itemName==null)
		$itemName=$item;
	$groupName=$config["group_names"]["gr$groupId"];
	if($groupName==null)
		$groupName="group $groupId";
	$logmsg=str_replace("<item>", $itemName, $logmsg);
	$logmsg = str_replace("<group>", $groupName, $logmsg);
	$sql="INSERT INTO log (groupId, message) VALUES (?,?);";
	$statement = $pdo->prepare($sql);

	if($statement->execute(array($groupId, $logmsg)))
		return true;
	return $statement->errorInfo()[2];
}
?>
