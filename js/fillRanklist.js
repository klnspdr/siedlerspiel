window.setInterval(function () {
    if (groupId == 100) {
        if(wholeGroupData != null) {
			let sortedGroupData = clone(wholeGroupData);
            sortedGroupData.sort((a, b) => (Number(a['final_score']) > Number(b['final_score'])) ? 1 : (Number((b['final_score']) > Number(a['final_score'])) ? -1 : 0));

            let tableContent = "<tbody id='rankListTableBody'>";
            let rank = 1;
            for (let i = sortedGroupData.length - 1; i >= 0; i--) {
                tableContent += "<tr><td id='rank'>" + rank + "</td><td id='groupName'>" + sortedGroupData[i]['name'] + "</td><td>Punkte: " + (sortedGroupData[i]['displayScore'] == true ? sortedGroupData[i]['final_score'] : "???") + "</td></tr>";
                rank++;
            }
            tableContent += "</tbody>";
            $('#rankListTableBody').replaceWith(tableContent);
        }
    }
},1000);



function clone(obj) {
	if (null == obj || "object" != typeof obj) return obj;
	var copy = obj.constructor();
	for (var attr in obj) {
		if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
		}
	return copy;
}
