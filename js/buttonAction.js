$(document).ready( function() {
    let clickedButton = $( ".buyItem" ).on( "click", function() {
       // let clientRole = $.post("ajax/getRole.php");
        var itemId = clickedButton.id;
        console.log(clickedButton);
      //$.get("ajax/buyItem.php", {groupId: 1, item: itemId}, function(data){alert(data)});
    });

});

