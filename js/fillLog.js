window.setInterval(function (){
    updateLog();
},1000);

function updateLog(){
    let log;
    $.getJSON("ajax/getLog.php",{})
        .done(function(data){
            log = data;

            if ( log.length <= 30){
                var indexStart = 0;
            } else {
                indexStart = log.length - 30;
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

