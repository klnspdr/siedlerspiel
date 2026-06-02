function startFillRanklist() {
    if (groupId == 100) {
        window.setInterval(function () {
            if(enemies) {
                let sortedEnemies = [...enemies].sort((a, b) => (Number(a.groupData['final_score']) > Number(b.groupData['final_score'])) ? 1 : (Number((b.groupData['final_score']) > Number(a.groupData['final_score'])) ? -1 : 0));
                console.log(sortedEnemies);
                let tableContent = "<tbody id='rankListTableBody'>";
                let rank = 1;
                for (let i = sortedEnemies.length - 1; i >= 0; i--) {
                    tableContent += "<tr><td id='rank'>" + rank + "</td><td id='groupName' style='color:" + config['group_colors']['main']['gr' + sortedEnemies[i].groupId] + ";  text-shadow: 1px  1px 0 " + config['group_colors']['outline']['gr' + sortedEnemies[i].groupId] + ", 1px -1px 0 " + config['group_colors']['outline']['gr' + sortedEnemies[i].groupId] + ", -1px  1px 0 " + config['group_colors']['outline']['gr' + sortedEnemies[i].groupId] + ", -1px -1px 0 " + config['group_colors']['outline']['gr' + sortedEnemies[i].groupId] + ";\n '>" + sortedEnemies[i].groupData.name + "</td><td>Punkte: " + (sortedEnemies[i].groupData.displayScore == true ? sortedEnemies[i].groupData.final_score : "???") + "</td></tr>";
                    rank++;
                }
                tableContent += "</tbody>";
                $('#rankListTableBody').replaceWith(tableContent);
            }
        },1000);
    }
}

function clone(obj) {
	if (null == obj || "object" != typeof obj) return obj;
	var copy = obj.constructor();
	for (var attr in obj) {
		if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
		}
	return copy;
}
