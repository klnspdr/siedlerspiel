function buyItemButton(itemNum,groupId){
    var result='error';
    //confirmPurchase();
    $.get("ajax/buyItem.php",{groupId: groupId, item: 'item'+itemNum})
        .done(function (data){
           // alert(data);
        printError(data);
    });
    updateInventory(groupId);
}

function runActionButton(actionNum, groupId) {
    var result = 'error';
    console.log('action'+actionNum);
    $.get("ajax/runAction.php", {groupId: groupId, action: 'action'+actionNum, targetId: 6})
        .done(function(data){

            alert(data);

        });
    updateInventory(groupId);
}

function confirmPurchase(itemNum){
    confirm()
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