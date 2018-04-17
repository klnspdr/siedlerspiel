$(document).ready( function() {

	var searchParams = new URLSearchParams(window.location.search)
	var groupId = 0;
	if( searchParams.has( 'groupId' ) )
		groupId = searchParams.get( 'groupId' );

	console.log( "this is the UI of group " + groupId );

	buildMatchfield();

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
		$( "#overlay" ).show();
	});

	$( ".close" ).on( "click", function() {
		$( "#overlay" ).hide();
	});
}

function readData() {
	var jqxhr = $.get( "ajax/getShipData.php", function( data ) {
		console.log( "test" );
	  	console.log( data );
	})
	.done(function() {
	 	console.log( "test2" );
	  	console.log( data );
	})
	.fail(function() {
	 	console.log( "error" );
	})
	.always(function() {
	 	console.log( "finished" );
	});

	console.log( "retrieveing data from server" );
	if( $( "#log" ).is( ':empty' ) )
		$( "#log" ).prepend( "<p>Log entry</p>" );
	else
		$( "#log" ).prepend( "<p class='divider'>Log entry</p>" );
}