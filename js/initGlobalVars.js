//declare global Variables for groupId, config  itemFiles and get this information at begin of script

let config = [];
$.ajax({
    url: "config/config.json",
    async: false,
    dataType: 'json',
    success: function (data) {
        config = data;
    }
});

let groupId = 2;
$.get("ajax/getRole.php")
    .done(function (data) {
        groupId = parseInt(data);
    });

let wholeGroupData = null;
let wholeInv = null;


let player;
let enemies = [];

function createPlayers(groupId) {
    for (let i = 1; i <= config['number_groups']; i++) {
        if (i !== groupId) {
            enemies.push(new Enemy(i));
        } else{
            enemies.push("");
        }

    }
    player = new Player(groupId);
    console.log(enemies);
    console.log(player);
}






