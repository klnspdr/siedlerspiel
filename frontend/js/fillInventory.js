//Vars groupId, config and


function updateInventory(groupId) {
    setTimeout(function () {
        $.getJSON("/ajax/getGroupData")
            .done(function(data){
                for (enemy of enemies) {
                    enemy.groupData = data[enemy.groupId - 1];
                }
                if (player) {
                    player.groupData = data[player.groupId - 1];
                }

                if(groupId != 100) {
                    let groupData = data[groupId - 1];
                    let groupHp = Math.ceil(groupData['hp']);
                    let groupMaxHp = Math.ceil(groupData['max_hp']);


                    $("#hpBar").progressbar({
                        max: groupMaxHp,
                        value: groupHp
                    });
                    $("#hpBar").css({'background-color': '#ffffff'});
                    if (groupHp / groupMaxHp >= 0.5) {
                        $("#hpBar > div").css({'background-color': '#00ff00'});
                    } else if (groupHp / groupMaxHp > 0.15) {
                        $("#hpBar > div").css({'background-color': '#ffe300'});
                    } else {
                        $("#hpBar > div").css({'background-color': '#ff0000'});
                    }
                    $("#hpBarText").text(groupHp + " / " + groupMaxHp + " " + config['hpName']);
                }
            });
        $.getJSON("/ajax/getGroupInventory")
            .done(function (data) {
                for (enemy of enemies) {
                    enemy.inventory = data[enemy.groupId - 1];
                }
                if (player) {
                    player.inventory = data[player.groupId - 1];
                }
                if(groupId != 100) {
                    let inventory = data[groupId - 1];

                    let tableContent = "<tbody id='invTableBody'>";
                    const numberCols = 7;
                    var numberRows = Math.ceil(config['number_items'] / numberCols);
                    for (var row = 0; row < numberRows; row++) {
                        tableContent += "<tr>";
                        for (var col = 1; col <= numberCols; col++) {
                            var itemNum = row * numberCols + col;
                            if(itemNum <= config['number_items']) {
                                tableContent += "<td><img class='itemIcon' src=' " + config['icon_file_dir'] + config['item' + itemNum]['icon_file_name'] + "' title='" + config['item' + itemNum]['name'] + "'>: " + inventory['item' + itemNum] + " </td>";
                            }
                        }
                        tableContent += "</tr>";
                    }
                    /*
                                for (let itemNum = 1; itemNum <= config.number_items; itemNum++) {
                                    tableContent += "<tr><td>" + config['item' + itemNum].name + ":</td><td>" + inventory['item' + itemNum] + "</td></tr>"
                                } */
                    tableContent += "</tbody>";

                    $("#invTableBody").replaceWith(tableContent);
//                $("#invTableBody").remove();
//                $("#invTable").after(tableContent);
                }
            });
    }, 100);
}

function startInventoryUpdates(groupId) {
    if(groupId !== 0) {
        window.setInterval(function () {

            updateInventory(groupId);

        },1000);
    }
}