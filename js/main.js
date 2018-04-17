$(document).ready( function() {

	buildMatchfield();

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

	});
}

function readData() {
	console.log( "retrieveing data from server" );
	$( "#log" ).prepend('<p>Log entry</p>');
}