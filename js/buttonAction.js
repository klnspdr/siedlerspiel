function buyItemButton(itemNum, itemName, groupId){
	console.log("buying item");
    var result='error';
    if (!confirmPurchase(itemNum, itemName))
		return;

    $.get("ajax/buyItem.php",{groupId: groupId, item: 'item'+itemNum})
        .done(function (data){
           // alert(data);
        printError(data);
    });
    //updateInventory(groupId);
}

function runActionButton(actionNum, groupId) {
    var result = 'error';
    console.log('action'+actionNum);
    $.get("ajax/runAction.php", {groupId: groupId, action: 'action'+actionNum, targetId: 6})
        .done(function(data){

			if(data != "1")
				alert(data);

        });
    //updateInventory(groupId);
}

function confirmPurchase(itemNum, itemName){
	var msg = "Sicher? Ihr habt auf \"" + itemName + "\" geklickt.";
    return confirm(msg)
}

function printError(result) {
    if (result != 1){
        alert(result);
    } else {

    }
}

function readConfig(){
    let config;
    $.getJSON("config/config.json", function(data){
        config = data;
    });
    return config;
}
