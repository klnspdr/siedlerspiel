<?php
//$shipId = $_GET["shipId"];

$abfrage = "SELECT id, hp, hp_max FROM ship ORDER BY id";	
$ergebnis = mysql_query($abfrage);

$ships = array();
while ($row = mysql_fetch_object($ergebnis))
{
	/*$ship = array();
	$ship[] = $row->id;
	$ship[] = $row->hp;
    $ship[] = $row->hp_max;
    $ships[] = $ship;*/
    $ships[] = $row;
}

echo json_encode($ships);
?>