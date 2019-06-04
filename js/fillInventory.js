function updateInventory(groupId) {
    $.getJSON("ajax/getGroupInventory.php")
        .done(function (data) {
            let config = [];
            $.ajax({
                url: "config/config.json",
                async: false,
                dataType: 'json',
                success: function(data) {
                    config = data;
                }
            });
                
           // var config = readConfig();
            console.log(config);

            let inventory = data[groupId - 1];
            //console.log(inventory);

            let tableContent = "<tbody id='invTableBody'>";
            for (let itemNum = 1; itemNum <= config.number_items; itemNum++) {
                tableContent += "<tr><td>" + config['item'+itemNum].name + ":</td><td>" + inventory['item' + itemNum] + "</td></tr>"
            }
            tableContent += "</tbody>";

            $("#invTableBody").remove();
            $("#invTable").after(tableContent);
            console.log(tableContent);
            console.log("updated inv");
        });
}