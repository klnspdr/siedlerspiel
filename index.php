<?php
session_start(); //start session
header("Content-Type: text/html; charset=utf-8");
//include("ajax/connect.php"); //establish database connection
include("ajax/readConfigFromIndex.php");
//client roles: 0: index page / configuration ; 1 - x: groups
if(isset($_GET['reset'])){
    $_SESSION['role'] = 0;
}
include("ajax/setRole.php");    //include script which sets role if new one is selected
?>

<!DOCTYPE html>
<html lang="de">
  <head>
      <title>Siedler 2019</title>

      <link rel="stylesheet" href="css/main.css">

      <!-- include P5.js library -->
      <script src="p5js/p5.min.js"></script>
      <script src="p5js/p5.dom.min.js"></script>

      <!-- include game logic -->
      <script src="js/main.js"></script>
  </head>
  <body>
  <?php
    $clientRole = $_SESSION['role'];       //get role for client
    if($clientRole == 0 || $clientRole == NULL){
        include("frontend/configure.php");
    } else if ($clientRole >= 1 && $clientRole <= $number_groups) {
        include("frontend/inGame.php");
    } else {
        echo "<h1>Not configured role selected</h1>";
    }
  ?>

  </body>
</html>
