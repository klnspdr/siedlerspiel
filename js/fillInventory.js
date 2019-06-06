let groupId = 0;
$.get("ajax/getRole.php",{})
    .done(function (data) {
        groupId = data;
    });

window.setInterval(function () {
    updateInventory(groupId);
},1000);

function updateInventory(groupId) {
    setTimeout(function () {
        $.getJSON("ajax/getGroupInventory.php")
            .done(function (data) {
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