var shipData = [];
var shipInventory = [];
var groupId = -1;

$(document).ready( function() {
	var searchParams = new URLSearchParams(window.location.search)
	
	if( searchParams.has( 'groupId' ) )
		groupId = searchParams.get( 'groupId' );
	else
		document.body.innerHTML = '';

	console.log( "this is the UI of group " + groupId );

	buildMatchfield();
	buildMenu();

	readData();
	setInterval( readData, 5000 ); // read data every 30 seconds

});

function buildMatchfield() {
	$( ".circle-container" ).css('max-height', $( "#matchfield" ).height() * 0.75 + 'px');
	$( ".circle-container" ).css('max-width', $( "#matchfield" ).height() * 0.75 + 'px');
	$( ".circle-container" ).height( $( "#matchfield" ).height() );
	$( ".circle-container" ).width( $( "#matchfield" ).height() );

	var radius = $( "#matchfield" ).height() * 0.75/2;
	$( ".deg0" ).css({'transform' : 'translate(' + radius + 'px'});
	$( ".deg60" ).css({'transform' : 'rotate(60deg) translate(' + radius + 'px) rotate(-60deg) '});
	$( ".deg120" ).css({'transform' : 'rotate(120deg) translate(' + radius + 'px) rotate(-120deg) '});
	$( ".deg180" ).css({'transform' : 'translate(-' + radius + 'px'});
	$( ".deg240" ).css({'transform' : 'rotate(240deg) translate(' + radius + 'px) rotate(-240deg) '});
	$( ".deg300" ).css({'transform' : 'rotate(300deg) translate(' + radius + 'px) rotate(-300deg) '});

	$( ".ship" ).on( "click", function() {
		generateInventory( $( this ).attr('id') );
		$( "#overlay" ).show();
	});

	$( ".close" ).on( "click", function() {
		$( "#overlay" ).hide();
	});
}

function buildMenu(){
	$( "#buyWasser" ).on( "click", function() {
		confirmDialog( "fass" )
	});
	$( "#buyZwieback" ).on( "click", function() {
		confirmDialog("zwieback");
	});
	$( "#buyMatte" ).on( "click", function() {
		confirmDialog("haengematte");
	});
	$( "#buySegel" ).on( "click", function() {
		confirmDialog("Segel");
	});
	$( "#buyKanone" ).on( "click", function() {
		confirmDialog("kanone");
	});
	$( "#buyKugel" ).on( "click", function() {
		confirmDialog("kanonenkugel");
	});
	$( "#buyRuder" ).on( "click", function() {
		confirmDialog("Ruder");
	});
	$( "#buyRUpgrade" ).on( "click", function() {
		confirmDialog("Ruderupgrade");
	});
	$( "#buyArmor" ).on( "click", function() {
		confirmDialog("schiffswandverstaerkung");
	});
	$( "#buyEnter" ).on( "click", function() {
		confirmDialog("enterhaken");
	});
	$( "#buyWaffen" ).on( "click", function() {
		confirmDialog("waffen");
	});
	$( "#buyLeiter" ).on( "click", function() {
		confirmDialog("strickleiter");
	});
	$( "#buyFigur" ).on( "click", function() {
		confirmDialog("gallionsfigur");
	});
	$( "#buyOrgel" ).on( "click", function() {
		confirmDialog("schiffsorgel");
	});
	$( "#buySchatz" ).on( "click", function() {
		confirmDialog("schatz");
	});
	$( "#buyRepair" ).on( "click", function() {
		confirmDialogRepair();
	});
	$( "#actEnter" ).on( "click", function() {
		confirmActionDialog("entern");
	});
	$( "#actSchiessen" ).on( "click", function() {
		confirmActionDialog("schießen");
	});
}

function repair() {
	if (shipData[groupId].max_hp == shipData[groupId].hp)
		throw "Es gibt nichts zu reparieren!";
	$.post( "ajax/repair.php", { shipId: groupId, hp: shipData[groupId].hp, maxHP: shipData[groupId].max_hp})
 		.done(function( data ) {
    		console.log( "Data Loaded: " + data );
    		// write in log
    		newLog( "repair", true, false);
		})
}

function buyItem( item ) {
	var count = shipInventory[groupId][item];
	console.log(item);
	console.log(count);
	if (item == "Segel" && count >= 6)
		throw "Dein Schiff hat schon alle Segel!";
	else if (item == "Ruder" && count == 1)
		throw "Dein Schiff hat schon ein Ruder!";
	else if (item == "Ruderupgrade" && count == 1)
		throw "Dein Schiff hat schon ein Ruder upgrade!";
	else if (item == "Ruderupgrade" && shipInventory[groupId]["Ruder"] == 0)
		throw "Du musst zuerst ein Ruder kaufen!";

	$.post( "ajax/buyItem.php", { shipId: groupId, item: item})
 		.done(function( data ) {
    		console.log( "Data Loaded: " + data );
    		// write in log
    		newLog( item, true, false);
		});
}

function runAction( action, target ) {
	if(action == "schießen"){
		if(shipInventory[groupId].Kanonen <= 0){
			throw "Du brauchst mindestens eine Kanone zum schießen!";
		}
		else if(shipInventory[groupId].Kanonenkugeln <= 0){
			throw "Du brauchst eine Kanonenkugel zum schießen!";
		}
		var segel = parseInt(shipInventory[target].Segel);
		var ruder = parseInt(shipInventory[target].Ruder);
		var ruderUpgrade = parseInt(shipInventory[target].Ruderupgrade);
		var ausweichen = (segel+ruder+ruderUpgrade)*10;
		var kanonen = shipInventory[groupId].Kanonen;
		var r = Math.floor((Math.random() * 100));
		var hit = r >= ausweichen;
		$.post( "ajax/useItem.php", { shipId: groupId, item: "kanonenkugel"})
			.done(function( data ) {
				console.log( "Data Loaded: " + data );
			});
		if(hit){
			var dmg = Math.min(kanonen*50, shipData[target].hp);
			$.post( "ajax/damage.php", { shipId: target, damage: dmg})
				.done(function( data ) {
					console.log( "Data Loaded: " + data );
				});
			newLog("schießen", false, false, target, dmg);
		}
		else{
			newLog("schießen", false, false, target, 0);
		}
	}
	else if(action == "entern"){
		if(shipInventory[groupId].Enterhaken <= 0){
			throw "Du brauchst mindestens einen Enterhaken zum entern!";
		}
		$.post( "ajax/useItem.php", { shipId: groupId, item: "enterhaken"})
			.done(function( data ) {
				console.log( "Data Loaded: " + data );
			});
		target = Math.floor((Math.random() * 6));
		var eigen = shipInventory[groupId].waffen;
		var gegner = shipInventory[target].waffen;
		if(target == groupId){
			newLog(null, false, false, target);
		}
		else if(eigen >= gegner){
			newLog(null, false, true, target);
		}
		else{
			newLog(null, false, false, target);
		}
	}
}

function newLog( item, buy, win, target=null, damage=0 ) {
	var action = shipData[groupId].name + " hat ein(e) " + item + " gekauft.";
	if (item == "repair")
		action = shipData[groupId].name + " hat sich repariert.";
	var win = win;
	if (!buy) {
		if(item == "schießen"){
			//hat getroffen
			if(damage > 0){
				action = shipData[groupId].name + " hat " + shipData[target].name + " " + damage + " Schaden zugefügt";
			}
			//daneben geschossen
			else{
				action = shipData[groupId].name + " hat " + shipData[target].name + " knapp verfehlt";
			}
		}
		else if (win)
			action = shipData[groupId].name + " hat " + shipData[target].name + " geentert";
		else if(groupId != target)
			action = shipData[groupId].name + " wurde von " + shipData[target].name + " geentert";
		else
			action = shipData[groupId].name + " versuchte zu entern und scheiterte";
	}
	$.post( "ajax/postLog.php", { shipId: buy?groupId:win?groupId:target, action: action, win: win})
 		.done(function( data ) {
    		console.log( "Data Loaded: " + data );
    		readData();
		});
}

function generateInventory( shipId ) {
	$( ".inventory" ).empty();
	$( ".inventory" ).append("<div class='inventoryTitle'>" + shipData[shipId].name + "</div>");
	$.each( shipInventory[shipId], function(index, element) {
		if( (index != "id" && index != "shipId" && index != "waffen") || (index == "waffen" && shipId == groupId)) {
			$( ".inventory" ).append("<div class='inv_row'><div class='inv_item'>" + index + "</div><div class='inv_item'>" + element + "</div></div>");
		}
	});
}

function readData() {
	shipData = [];
	var shipDataCall = $.getJSON( "ajax/getShipData.php", function( data ) {
		$.each(data, function(index, element) {
			shipData.push(element);
		    $( "#ship" + index + "HP" ).text(element.name + " (" + element.hp + "/" + element.max_hp + " HP)");
		    if(element.hp == 0) {
		    	$( "#shipIMG_" + index).attr("src","img/dead.png");
		    }
		    else {
		    	$( "#shipIMG_" + index).attr("src","img/ship.png");
		    }
		});
	})
	.fail(function( error ) {
	 	console.log( "error" );
	 	console.log( error );
	})

	shipInventory = [];
	var shipInventoryCall = $.getJSON( "ajax/getShipInventory.php", function( data ) {
		$.each(data, function(index, element) {
			shipInventory.push(element);
		});

		// set ship icons
		for( var i = 0; i < 6; i++) {
			$.each( shipInventory[i], function(index, element) {
				if (index == "Kanonen") {
					$( "#" + i + "-0").text(element);
				}
				else if (index == "Ruder") {
					$( "#" + i + "-1").text(element);
				}
				else if (index == "Ruderupgrade") {
					if (element == '1')
						$( "#" + i + "-1").text('2');
				}
				else if (index == "Segel") {
					$( "#" + i + "-2").text(element);				
				}
			});
		}
	})
	.fail(function( error ) {
		console.log( "error");
	 	console.log( error );
	})

	var logCall = $.getJSON( "ajax/getLog.php", function( data ) {
		$( "#log" ).empty();
		$.each(data, function(index, element) {
			if (index == 0)
				$( "#log" ).prepend( "<p>" + element.action + "</p>" );
			else
				$( "#log" ).prepend( "<p class='divider'>" + element.action + "</p>" );
		});
	})
	.fail(function( error ) {
		console.log( "error");
	 	console.log( error );
	})
}

function confirmDialogRepair( ) {

    var title = 'Wirklich reparieren?';
    var text = "Willst du wirklich <b>reparieren</b>?";

    if (!$( "#dialog-confirm" ).length) {
        $('<div id=\"dialog-confirm\" class=\"confirmDialog\"></div>').appendTo('body')
        .html('<div><h6>' + text + '</h6></div>')
        .dialog({
            modal: true, title: title, zIndex: 10000, autoOpen: true,
            width: 'auto', resizable: false,
            buttons: {
                Nein: function () {
                    $(this).dialog("close");
                },
                Ja: function () {
                	try{
						repair();
					}
					catch(err){
						alert(err);
					}
                    $(this).dialog("close");
                }                
            },
            close: function (event, ui) {
                $(this).remove();
            }
        });

        makeButtonsNicer();
    }
}

function confirmDialog( item ) {

    var title = item + ' wirklich kaufen?';
    var text = "Willst du \"" + item + "\" wirklich <b>kaufen</b>?";

    if (!$( "#dialog-confirm" ).length) {
        $('<div id=\"dialog-confirm\" class=\"confirmDialog\"></div>').appendTo('body')
        .html('<div><h6>' + text + '</h6></div>')
        .dialog({
            modal: true, title: title, zIndex: 10000, autoOpen: true,
            width: 'auto', resizable: false,
            buttons: {
                Nein: function () {
                    $(this).dialog("close");
                },
                Ja: function () {
                	try{
						buyItem( item );
					}
					catch(err){
						alert(err);
					}
                    $(this).dialog("close");
                }                
            },
            close: function (event, ui) {
                $(this).remove();
            }
        });

        makeButtonsNicer();
    }
}

function confirmActionDialog( action ) {

    var title = 'Wirklich ' + action + ' ?';
    var text = "Willst du wirklich <b>" + action + "</b>?";

    if (!$( "#dialog-confirm" ).length) {
        $('<div id=\"dialog-confirm\" class=\"confirmDialog\"></div>').appendTo('body')
        .html('<div><h6>' + text + '</h6></div>'
			+ '<select id=\"target\"></select>')
        .dialog({
            modal: true, title: title, zIndex: 10000, autoOpen: true,
            width: 'auto', resizable: false,
            buttons: {
                Nein: function () {
                    $(this).dialog("close");
                },
                Ja: function () {
                	try{
						var tgroup = $("#target option:selected").index();
						if(tgroup >= groupId){
							tgroup++;
						}
						runAction( action, tgroup );
					}
					catch(err){
						alert(err);
					}
                    $(this).dialog("close");
                }                
            },
			create: function(event, ui) {
				$( "#target" ).selectmenu();
				var $dropdown = $("#target");
				for(var i = 0; i < 6; i++){
					if(groupId != i){
						$dropdown.append($("<option />").text(shipData[i].name));
					}
				}
				if(action != "schießen"){
					$("#target-button").hide();
				}
			},
            close: function (event, ui) {
                $(this).remove();
            }
        });

        makeButtonsNicer();
    }
}

function makeButtonsNicer() {
    // seperate the two buttons for better usability
    $(".ui-dialog-buttonset").css('float', 'none');
    $(".ui-dialog-buttonset button:first").css('float', 'left');
    $(".ui-dialog-buttonset button:last").css('float', 'right');
    // set better button design
    $(".ui-dialog-buttonset button").addClass("ui-button");
    $(".ui-dialog-buttonset button").css('border-radius', '5px');
    // remove the x-close button
    $(".ui-dialog-titlebar-close").remove();
}
