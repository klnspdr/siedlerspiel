window.setInterval(function () {
    //if (groupId == 100) {

        $.getJSON("ajax/getRanklist.php")
            .done(function(data){
                console.log(data);
                let sortedGroupData = data;
                let tableContent = "<tbody id='rankListTableBody'>";
                let rank = 1;
                for(let i = sortedGroupData.length -1; i >= 0; i--){
                    tableContent += "<tr><td>"+rank+"</td><td>" + sortedGroupData[i]['name'] + "</td><td>Punkte: "+ sortedGroupData[i]['final_score'] +"</td></tr>";
                    rank++;
                }
                tableContent += "</tbody>";
                $('#rankListTableBody').replaceWith(tableContent);

                console.log("updated ranks");
            })
            .fail(function () {
                console.log("error");
            });
   // }


},1000);


