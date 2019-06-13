function buyItemButton(itemNum, itemName, groupId){
	console.log("buying item");
    var result='error';

	var dialogText = "Sicher? Ihr habt auf <b>"+itemName+"</b> geklickt";
//	var onConfirm = "$.get(\"ajax/buyItem.php\",{groupId: "+groupId+", item: \"item"+itemNum+"\"}).done(function (data){ printError(data); });";
	var onConfirm = "buyItem("+itemNum+", "+groupId+");";
	confirmDialog(dialogText, onConfirm);
}

function buyItem(itemNum, groupId){
    $.get("ajax/buyItem.php",{groupId: groupId, item: 'item'+itemNum})
        .done(function (data){
           // alert(data);
        printError(data);
    });
}

function runActionButton(actionNum, actionName, groupId) {
	var dialogText = "Sicher? Ihr habt auf <b>"+actionName+"</b> geklickt";
	var onConfirm = "runAction("+actionNum+", "+groupId+");";
	confirmDialog(dialogText, onConfirm);
}

function runAction(actionNum, groupId){
    var result = 'error';
    console.log('action'+actionNum);
    let targetId = null;
	if(config['action'+actionNum]['randomOpponent'] == true){
        targetId = Math.floor((Math.random()*config['number_groups'])+1);//console.log(targetId);
        $.get("ajax/runAction.php", {groupId: groupId, action: 'action'+actionNum, targetId: targetId})
            .done(function(data){
                if(data != 1) {
                    alert(data);
                }
            });
    } else {
        selectMode = true;
    }
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

function confirmDialog(message, onConfirm){
	if (!$( "#dialog-confirm" ).length) {
		$('<div id=\"dialog-confirm\" class=\"confirmDialog\"></div>').appendTo('body')
		.html('<div>' + message + '</div>')
		.dialog({
			modal: true, autoOpen: true,
			width: 'auto', resizable: false, dialogClass: "confirmDialog",
			buttons: {
				Nein: function () {
					$(this).dialog("close");
				},
				Ja: function () {
					console.log("Ja clicked");
					eval(onConfirm);
					$(this).dialog("close");
				}                
			},
			close: function (event, ui) {
				$(this).remove();
			}
		});
	}
}
