"use strict";
window.setInterval(function (){
    updateLog();
},1000);

function updateLog(){
    let log;
    $.getJSON("ajax/getLog.php",{})
        .done(function(data){
            log = data;

            let shownMessages = Math.floor(0.8 * $(window).height()/15)-2 - 10;

            if(groupId != 100){
                shownMessages -= 9;
            }
            if ( log.length <= shownMessages){
                var indexStart = 0;
            } else {
                indexStart = log.length - shownMessages;
            }
            var tableContent = "<tbody id='logTableBody'>";
            for(var row = indexStart; row < log.length; row++){
                tableContent += "<tr><td>"+ log[row]['message'] +"</td></tr>"
            }
            tableContent += "</tbody>";

            $("#logTableBody").remove();
            $("#logTable").after(tableContent);
        });
}

