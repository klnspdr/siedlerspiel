<?php
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
	$conn->close();
	die("Error: Invalid item");
}
//check if groupId is valid
if($groupId <= 0 || $groupId > $number_groups){
	$conn->close();
	die("Error: Invalid group number");
}


$plusMaxHP=$config[$item]["plusMaxHP"];
$plusHP=$config[$item]["plusHP"];
$max=$config[$item]["max"];
$requirement=$config[$item]["requirement"];

if(!checkMax($groupId, $item, $max, $conn)){
	$conn->close();
	$errormsg=getMaxErrorMessage($item, $max, $config);
	die($errormsg);
}
if(!checkRequirement($groupId, $requirement, $number_items, $conn)){
	$conn->close();
	$errormsg=getRequirementErrorMessage($item, $requirement, $config);
	die($errormsg);
}


$sql="UPDATE inventory, groups SET inventory.$item=inventory.$item+1";
if($plusMaxHP != null)
	$sql.=", groups.max_hp=groups.max_hp+$plusMaxHP";
if($plusHP!=null)
	$sql.=", groups.hp=LEAST(groups.hp+$plusHP, groups.max_hp)";
$sql.=" WHERE inventory.groupId=$groupId AND groups.groupId=$groupId;";

if ($conn->query($sql) === TRUE) {
	echo true;
} else {
	echo $conn->error;
}

$conn->close();

//////////////////////////////////////////////////////////////////////////
//																		//
//								Functions								//
//																		//
//////////////////////////////////////////////////////////////////////////

//returns true if requirement matched, false otherwise
function checkRequirement($fgroupId, $frequirement, $number_items, $conn){
	if($frequirement == null)
		return true;
	$fcorrectItem=false;
	for($i=0;$i<$number_items;$i++){
		if($frequirement == "item".$i)
			$fcorrectItem=true;
	}
	if(!$fcorrectItem)
		return false;
	$fsql="SELECT ".$frequirement." FROM inventory WHERE groupId=".$fgroupId.";";
	$fresult=$conn->query($fsql);
	if ($fresult === "false") {
		return false;
	} else {
		if ($fresult->num_rows === 1) {
			$num=$fresult->fetch_assoc();
			return $num[$frequirement] > 0;
		}
		return false;
	} 
}

//returns true if max not reached yet, meaning that it is possible to buy the item
function checkMax($groupId, $item, $max, $conn){
	if($max <= 0)
		return false;
	$sql="SELECT ".$item." FROM inventory WHERE groupId=".$groupId.";";
	$result=$conn->query($sql);
	if ($result === "false") {
		return false;
	} else {
		if ($result->num_rows === 1) {
			$num=$result->fetch_assoc();
			return $num[$item] < $max;
		}
		return false;
	} 

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
		$errormsg = "You can buy at most <max> <item>.";
	$itemName=$config[$item]["name"];
	if($itemName==null)
		$itemName=$item;

	$errormsg=str_replace("<item>", $itemName, $errormsg);
	return str_replace("<max>", $max, $errormsg);
}
?>
