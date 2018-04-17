var shipData = [];
var shipInventory = [];
var groupId = -1;

$(document).ready( function() {

	var searchParams = new URLSearchParams(window.location.search)
	
	if( searchParams.has( 'groupId' ) )
		groupId = searchParams.get( 'groupId' );

	console.log( "this is the UI of group " + groupId );

	buildMatchfield();
	buildMenu();

	readData();
	setInterval( readData, 30000 ); // read data every 30 seconds

});

function buildMatchfield() {
	$( ".circle-container" ).height( $( "#matchfield" ).height() * 0.75);
	$( ".circle-container" ).width( $( "#matchfield" ).height() * 0.75 );

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
		buyItem("fass");
	});
	$( "#buyZwieback" ).on( "click", function() {
		buyItem("zwieback");
	});
	$( "#buyMatte" ).on( "click", function() {
		buyItem("haengematte");
	});
	$( "#buySegel" ).on( "click", function() {
		try{
			buyItem("segel");
		}
		catch(err){
			alert(err);
		}
	});
	$( "#buyKanone" ).on( "click", function() {
		buyItem("kanone");
	});
	$( "#buyKugel" ).on( "click", function() {
		buyItem("kanonenkugel");
	});
	$( "#buyRuder" ).on( "click", function() {
		try{
		buyItem("ruder");
		}
		catch(err){
			alert(err);
		}
	});
	$( "#buyRUpgrade" ).on( "click", function() {
		try{
		buyItem("ruderupgrade");
		}
		catch(err){
			alert(err);
		}
	});
	$( "#buyArmor" ).on( "click", function() {
		buyItem("schiffswandverstaerkung");
	});
	$( "#buyEnter" ).on( "click", function() {
		buyItem("enterhaken");
	});
	$( "#buyWaffen" ).on( "click", function() {
		buyItem("waffen");
	});
	$( "#buyLeiter" ).on( "click", function() {
		buyItem("strickleiter");
	});
	$( "#buyFigur" ).on( "click", function() {
		buyItem("gallionsfigur");
	});
	$( "#buyOrgel" ).on( "click", function() {
		buyItem("schiffsorgel");
	});
	$( "#buySchatz" ).on( "click", function() {
		buyItem("schatz");
	});
	$( "#buyRepair" ).on( "click", function() {
	});
}

function buyItem( item ) {
	var count = shipInventory[groupId][item];

<<<<<<< HEAD
	if (item == "segel" && count == 6 || item == "ruderupgrade" && count == 1)
		throw "Zuviele Segel oder Ruder!";
=======
	if (item == "segel" && count == 6)
		throw "Dein Schiff hat schon alle Segel!";
	else if (item == "ruder" && count == 1)
		throw "Dein Schiff hat schon ein Ruder!";
	else if (item == "ruderupgrade" && count == 1)
		throw "Dein Schiff hat schon ein Ruder upgrade!";
	else if (item == "ruderupgrade" && shipInventory[groupId]["ruder"] == 0)
		throw "Du musst zuerst ein Ruder kaufen!";
>>>>>>> 276cd45271c74cd33715d9a44018061a647c98b6

	$.post( "ajax/buyItem.php", { shipId: groupId, item: item, count: count})
 		.done(function( data ) {
    		console.log( "Data Loaded: " + data );
    		// write in log
    		newLog( item, true, false);
		});
}

function newLog( item, buy, win ) {
	var action = "Shiff " + groupId + " hat ein " + item + " gebaut.";
	var win = win;
	if (!buy) {
		if (win)
			action = "Shiff " + groupId + " hat einen Kampf gewonnen";
		else
			action = "Shiff " + groupId + " hat einen Kampf verloren";
	}
	$.post( "ajax/postLog.php", { shipId: groupId, action: action, win: win})
 		.done(function( data ) {
    		console.log( "Data Loaded: " + data );
    		readData();
		});
}

function generateInventory( shipId ) {
	$( ".inventory" ).empty();
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
		    $( "#ship" + index + "HP" ).text(element.hp + " HP");
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

function confirmDialog( id, action ) {

    var title = action + ' wirklich ausfuehren?';
    var text = "Willst du die \"" + action + "\" wirklich <b>ausverkauft</b>?";

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
