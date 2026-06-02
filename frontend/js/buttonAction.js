function buyItemButton(itemNum, itemName, groupId){
    var result='error';

	var dialogText = "Sicher? Ihr habt auf <b>"+itemName+"</b> geklickt";
//	var onConfirm = "$.get(\"ajax/buyItem.php\",{groupId: "+groupId+", item: \"item"+itemNum+"\"}).done(function (data){ printError(data); });";
	var onConfirm = "buyItem("+itemNum+", "+groupId+");";
	confirmDialog(dialogText, onConfirm);
}

function buyItem(itemNum, groupId){
	console.log("Buying item"+itemNum+" for group "+groupId);
	$.get("/ajax/buyItem",{groupId: groupId, item: 'item'+itemNum})
        .done(function (data){
           // alert(data);
		   console.log(data);
        	if(data.success != true) {
                    alert(data.message);
                }
    	})
}

function runActionButton(actionNum, actionName, groupId) {
	var dialogText = "Sicher? Ihr habt auf <b>"+actionName+"</b> geklickt";
	var onConfirm = "runAction("+actionNum+", "+groupId+");";
	confirmDialog(dialogText, onConfirm);
}

function runAction(actionNum, groupId){
	console.log("Running action"+actionNum+" for group "+groupId);
    var result = 'error';
    let targetId = null;
	if(config['action'+actionNum]['randomOpponent'] == true){
        targetId = Math.floor((Math.random()*config['number_groups'])+1);
        $.get("ajax/runAction", {groupId: groupId, action: 'action'+actionNum, targetId: targetId})
            .done(function(data){
				console.log(data);
                if(data.success != true) {
                    alert(data.message);
                }
            })
    } else {
		currentAction = actionNum;
        selectMode = true;
    }
}

function confirmPurchase(itemNum, itemName){
	var msg = "Sicher? Ihr habt auf \"" + itemName + "\" geklickt.";
    return confirm(msg)
}

function printError(result) {
    if (result.success != true){
        alert(result.message);
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
