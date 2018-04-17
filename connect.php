<?php 
// establish database connection
$verbindung = mysql_connect("localhost", "root" , "ewv976") 
or die("Verbindung zur Datenbank konnte nicht hergestellt werden"); 
mysql_query("SET NAMES 'utf8'", $verbindung);
mysql_set_charset('utf8', $verbindung);
mysql_select_db("siedlerspiel") or die ("Datenbank konnte nicht ausgewaehlt werden");
?>