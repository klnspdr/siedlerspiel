<?php
session_start(); //start session
header("Content-Type: text/html; charset=utf-8");
//include("ajax/connect.php"); //establish database connection
include("ajax/readConfigFromIndex.php");
//client roles: 0: index page / configuration ; 1 - x: groups; 100 for overview page
if(isset($_GET['reset'])){
    $_SESSION['role'] = 0;
}
include("ajax/setRole.php");    //include script which sets role if new one is selected
?>

<!DOCTYPE html>
<html lang="de">
  <head>
      <title>Siedler 2019</title>



      <!-- JQuery -->
      <script src="jquery/jquery.min.js"></script>

      <script src="jquery/hammer.js"></script>

      <link rel="stylesheet" href="jqueryUI/jquery-ui.min.css">
      <script src="jqueryUI/jquery-ui.min.js"></script>

      <!-- include P5.js library -->
      <script src="p5js/p5.min.js"></script>
      <script src="p5js/p5.dom.min.js"></script>

      <!-- include custom JS classes -->
      <script src="js/dialogClass.js"></script>

      <!-- include game logic -->
      <script src="js/groupClass.js"></script>
      <script src="js/initGlobalVars.js"></script>
      <script src="js/gameField.js"></script>
      <script src="js/buttonAction.js"></script>
      <script src="js/fillLog.js"></script>
      <script src="js/fillInventory.js"></script>
      <script src="js/fillRanklist.js"></script>


      <!-- include western_font -->
      <link rel="stylesheet" href="western_font/stylesheet.css" type="text/css"/>

      <link rel="stylesheet" href="css/main.css">

  </head>
  <body>
  <?php
    $clientRole = $_SESSION['role'];       //get role for client
    if($clientRole == 0 || $clientRole == NULL){
        include("frontend/configure.php");
    } else if ($clientRole >= 1 && $clientRole <= $number_groups) {
        include("frontend/inGame.php");
    } else if($clientRole == 100){
        include("frontend/overview.php");
    } else {
        echo "<h1>Not configured role selected</h1>";
    }
  ?>

  </body>
</html>
