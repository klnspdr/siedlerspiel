//declare global Variables for groupId, config and itemFiles and get this information at begin of script
let groupId = 0;
let config = [];
let itemFiles = [];
$.ajax({
    url: "config/config.json",
    async: false,
    dataType: 'json',
    success: function (data) {
        config = data;
    }
});

$.ajax({
    url: "img/items2/itemsFiles.json",
    async: false,
    dataType: 'json',
    success: function (data) {
        itemFiles = data;
    }
});
$.get("ajax/getRole.php",{})
    .done(function (data) {
        groupId = data;
    });

window.setInterval(function () {
    updateInventory(groupId);
},1000);

function updateInventory(groupId) {
    setTimeout(function () {
        $.getJSON("ajax/getGroupData.php")
            .done(function(data){
                let groupData = data[groupId - 1];
                let groupHp = Math.ceil(groupData['hp']);
                let groupMaxHp = Math.ceil(groupData['max_hp']);

                $("#hpBarText").text(groupHp +  " / " +  groupMaxHp + " " + config['hpName']);
                $("#hpBar").progressbar({
                    max: groupMaxHp,
                    value: groupHp
                });
               $("#hpBar").css({'background-color': '#ffffff'});
               if(groupHp/groupMaxHp >= 0.5){
                   $("#hpBar > div").css({'background-color':'#00ff00'});
               } else if (groupHp/groupMaxHp > 0.15){
                   $("#hpBar > div").css({'background-color':'#ffe300'});
               } else {
                   $("#hpBar > div").css({'background-color':'#ff0000'});
               }

            });
        $.getJSON("ajax/getGroupInventory.php")
            .done(function (data) {
                let inventory = data[groupId - 1];


                let tableContent = "<tbody id='invTableBody'>";
                var numberRows = Math.ceil(config['number_items'] / 6);
                for (var row = 0; row < numberRows; row++) {
                    tableContent += "<tr>";
                    for (var col = 1; col <= 6; col++) {
                        var itemNum = row * 6 + col;
                        tableContent += "<td><img class='itemIcon' src='img/items2/" + itemFiles['item' + itemNum] + "'>: " + inventory['item' + itemNum] + " </td>";
                    }
                    tableContent += "</tr>";
                }
                /*
                            for (let itemNum = 1; itemNum <= config.number_items; itemNum++) {
                                tableContent += "<tr><td>" + config['item' + itemNum].name + ":</td><td>" + inventory['item' + itemNum] + "</td></tr>"
                            } */
                tableContent += "</tbody>";

                $("#invTableBody").remove();
                $("#invTable").after(tableContent);
                console.log("updated inv");
            });
    }, 100);
}