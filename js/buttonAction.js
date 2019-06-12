function buyItemButton(itemNum,groupId){
    var result='error';
    //confirmPurchase();
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
    let targetId = null;
    if(actionNum == 1){
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

    //updateInventory(groupId);
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