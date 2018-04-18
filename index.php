<?php
include("connect.php"); //establish database connection   
?>

<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Siedlerspiel</title>

    <!-- JQuery -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>

    <script src="https://hammerjs.github.io/dist/hammer.js"></script>
    
    <link rel="stylesheet" href="jqueryUI/jquery-ui.min.css">
    <script src="jqueryUI/jquery-ui.min.js"></script>

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
    <!-- Bootstrap core CSS -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0/css/bootstrap.min.css" rel="stylesheet">
    <!-- Material Design Bootstrap -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/mdbootstrap/4.5.0/css/mdb.min.css" rel="stylesheet">

    <!-- Bootstrap tooltips -->
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.13.0/umd/popper.min.js"></script>
    <!-- Bootstrap core JavaScript -->
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0/js/bootstrap.min.js"></script>
    <!-- MDB core JavaScript -->
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/mdbootstrap/4.5.0/js/mdb.min.js"></script>

    <script src="js/main.js"></script>
    <link rel="stylesheet" href="css/main.css">
  </head>

  <body>

    <div id="matchfield">
      <div id="overlay">
        <div class="close">
          <span id="x">X</span>
        </div>
    		<div class="inventory">
    		</div>
      </div>
      <div class='circle-container'>
        <a href='#' class='deg0 ship' id="0"><span class="shipText" id="ship0HP" >X HP</span><img src='img/ship.png' id="shipIMG_0"></a>
        <a href='#' class='deg60 ship' id="1"><span class="shipText" id="ship1HP" >X HP</span><img src='img/ship.png' id="shipIMG_1"></a>
        <a href='#' class='deg120 ship' id="2"><span class="shipText" id="ship2HP" >X HP</span><img src='img/ship.png' id="shipIMG_2"></a>
        <a href='#' class='deg180 ship' id="3"><span class="shipText" id="ship3HP" >X HP</span><img src='img/ship.png' id="shipIMG_3"></a>
        <a href='#' class='deg240 ship' id="4"><span class="shipText" id="ship4HP" >X HP</span><img src='img/ship.png' id="shipIMG_4"></a>
        <a href='#' class='deg300 ship' id="5"><span class="shipText" id="ship5HP" >X HP</span><img src='img/ship.png' id="shipIMG_5"></a>
      </div>
    </div>

    <div id="sidebar" class="right-to-left">
      <div id="log"></div>
      <div id="menu">
		<div class="kaufenText">Kaufen</div>
		<a class="ui-button ui-widget ui-corner-all buyButton" id="buyWasser" href="#">Fass Wasser</a>
		<a class="ui-button ui-widget ui-corner-all buyButton" id="buyZwieback" href="#">Schiffs- zwieback</a>
		<a class="ui-button ui-widget ui-corner-all buyButton" id="buyMatte" href="#">Hängematte</a>
		<a class="ui-button ui-widget ui-corner-all buyButton" id="buySegel" href="#">Segel</a>
		<a class="ui-button ui-widget ui-corner-all buyButton" id="buyKanone" href="#">Kanone</a>
		<a class="ui-button ui-widget ui-corner-all buyButton" id="buyKugel" href="#">Kanonenkugel</a>
		<a class="ui-button ui-widget ui-corner-all buyButton" id="buyRuder" href="#">Ruder</a>
		<a class="ui-button ui-widget ui-corner-all buyButton" id="buyRUpgrade" href="#">Ruder Upgrade</a>
		<a class="ui-button ui-widget ui-corner-all buyButton" id="buyArmor" href="#">Schiffswand- verstärkung</a>
		<a class="ui-button ui-widget ui-corner-all buyButton" id="buyEnter" href="#">Enterhaken</a>
		<a class="ui-button ui-widget ui-corner-all buyButton" id="buyWaffen" href="#">Waffen</a>
		<a class="ui-button ui-widget ui-corner-all buyButton" id="buyLeiter" href="#">Strickleiter</a>
		<a class="ui-button ui-widget ui-corner-all buyButton" id="buyFigur" href="#">Gallionsfigur</a>
		<a class="ui-button ui-widget ui-corner-all buyButton" id="buyOrgel" href="#">Schiffsorgel</a>
		<a class="ui-button ui-widget ui-corner-all buyButton" id="buySchatz" href="#">Schatz</a>
		<a class="ui-button ui-widget ui-corner-all buyButton" id="buyRepair" href="#">Reparaturkit</a>
		<div class="kaufenText">Aktionen</div>
		<a class="ui-button ui-widget ui-corner-all buyButton" id="actEnter" href="#">Entern</a>
		<a class="ui-button ui-widget ui-corner-all buyButton" id="actSchiessen" href="#">Schießen</a>
      </div>
    </div>

  </body>
</html>
