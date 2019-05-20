<?php
include("connect.php"); //establish database connection   
include("readConfig.php");
$ch = curl_init();
$tests_performed=0;
$tests_successfull=0;

//TEST buy item
//Test invalid item
$item="item".$number_items+1;
$output = callBuyItem($ch, "item=$item&groupId=1");
$tests_performed++;
if($output === "Error: Invalid item")
	$tests_successfull++;
else
	echo "Test invalid item failed, output was $output <br>\n";

$item="komischerundfalscherText";
$output = callBuyItem($ch, "item=$item&groupId=1");
$tests_performed++;
if($output === "Error: Invalid item")
	$tests_successfull++;
else
	echo "Test 2 invalid item failed, output was $output <br>\n";

//Test requirement not satisfied
setInventory(array("item3"=>0, "item4"=>0), 1, $pdo);
$output = callBuyItem($ch, "item=item4&groupId=1");
$tests_performed++;
if($output != "1")
	$tests_successfull++;
else
	echo "Test requirement not satisfied failed, output was $output <br>\n";
//Test success
$output = callBuyItem($ch, "item=item3&groupId=1");
$tests_performed++;
if($output === "1")
	$tests_successfull++;
else
	echo "Test buy successfully failed, output was $output <br>\n";

//Test requirement satisfied
$output = callBuyItem($ch, "item=item4&groupId=1");
$tests_performed++;
if($output === "1")
	$tests_successfull++;
else
	echo "Test requirement satisfied failed, output was $output <br>\n";

//Test max reached
$output = callBuyItem($ch, "item=item4&groupId=1");
$tests_performed++;
if($output != "1")
	$tests_successfull++;
else
	echo "Test max reached, output was $output <br>\n";

//Test invalid group
$output = callBuyItem($ch, "item=item1&groupId=".($number_groups+1));
$tests_performed++;
if($output === "Error: Invalid group number")
	$tests_successfull++;
else
	echo "Test invalid group failed, output was: $output <br>\n";

$output = callBuyItem($ch, "item=item1&groupId=0");
$tests_performed++;
if($output === "Error: Invalid group number")
	$tests_successfull++;
else
	echo "Test 2 invalid group failed, output was: $output <br>\n";


//Test runAction








echo "Tests performed: $tests_performed <br>\n";
echo "Tests successfull: $tests_successfull <br> \n";

curl_close($ch);


//////////////////////////////////////////////////////////////////////////
//																		//
//								Functions								//
//																		//
//////////////////////////////////////////////////////////////////////////

function callBuyItem($ch, $opts){
	curl_reset($ch);
	curl_setopt($ch, CURLOPT_URL, "localhost/siedlerspiel/ajax/buyItem.php?".$opts);
//	curl_setopt($ch, CURLOPT_URL, "localhost/siedlerspiel/ajax/buyItem.php");
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
//	curl_setopt($ch, CURLOPT_POSTFIELDS, $opts);
//	curl_setopt($ch, CURLOPT_POST, 1);
	return curl_exec($ch);
}

function setInventory($items, $groupId, $pdo){
	$sql="UPDATE inventory SET   ";
	$keys = array_keys($items);
	foreach($keys as $key){
		$sql.="$key=".$items[$key].", ";
	}
	$sql=substr($sql, 0, strlen($sql)-2);
	$sql.=" WHERE groupId=$groupId";
	if ($pdo->query($sql) === false)
		echo $pdo->errorInfo()[2];
}
?>
