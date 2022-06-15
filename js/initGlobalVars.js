//declare global Variables for groupId, config  itemFiles and get this information at begin of script
let selectMode = false;
let currentAction = 0;
let invModeGroup = 0;

//Images:
let tombStone;
let bgMap;
let skull;
let itemIcons = [];
let groupIcons = [];
let groupIconSize;

let groupPositions = [];

let config = [];
$.ajax({
    url: "config/config.json",
    async: false,
    dataType: 'json',
    success: function (data) {
        config = data;
    }
});

let groupId = 100;
$.get("ajax/getRole.php")
    .done(function (data) {
        groupId = parseInt(data);
        document.title = "Siedler 2019 - " + (groupId !== 100 ? config.group_names[`gr${groupId}`] : "Überblick");
    });

let wholeGroupData = null;
let wholeInv = null;


let player;
let enemies = [];

function createPlayers(groupId) {
    //groupId 100 is reserved for the overview screen
    if (groupId !== 100) {
        if(config.groupPositioning === "solid"){
          player = new Player(groupId, mapSolidX(groupPositions[groupId-1].x), mapSolidY(groupPositions[groupId-1].y), reverseMapX(mapSolidX(groupPositions[groupId-1].x)), reverseMapY( mapSolidY(groupPositions[groupId-1].y)), groupIconSize);
          for (let i = 1; i <= config['number_groups']; i++) {
              if (i !== groupId) {

                  enemies.push(new Enemy(i, mapSolidX(groupPositions[i-1].x), mapSolidY(groupPositions[i-1].y), reverseMapX(mapSolidX(groupPositions[i-1].x)), reverseMapY( mapSolidY(groupPositions[i-1].y)), groupIconSize));
              } else {
                  enemies.push("");
              }
          }
        } else {
        player = new Player(groupId, mapX(0), mapY(height * 0.35), 0, height * 0.35, groupIconSize);

        for (let i = 1; i <= config['number_groups']; i++) {
            if (i !== groupId) {
                let angle = TWO_PI / config['number_groups'] * i + PI / 2 - PI / config['number_groups'] * 2 * player.groupId;
                //positions are calculated using triangular maths with the witdth/height of the witdh/height of thee canvas. The coefficiants 0.4/0.35 are used to create an oval insteaad of a circle
                let x = cos(angle) * width * 0.4;
                let y = sin(angle) * height * 0.35;
                enemies.push(new Enemy(i, mapX(x), mapY(y), x, y, groupIconSize));
            } else {
                enemies.push("");
            }

        }
      }
    } else {
      if(config.groupPositioning === "solid"){
        console.log("solid");
        for (let i = 1; i <= config['number_groups']; i++) {
            enemies.push(new Enemy(i, mapSolidX(groupPositions[i-1].x), mapSolidY(groupPositions[i-1].y), reverseMapX(mapSolidX(groupPositions[i-1].x)), reverseMapY( mapSolidY(groupPositions[i-1].y)), groupIconSize));
        }
      } else {
        console.log("fluid");
        for (let i = 1; i <= config['number_groups']; i++) {
            let angle = TWO_PI / config['number_groups'] * i + PI / 2 - PI / config['number_groups'] * 2 ;
            let x = cos(angle) * width * 0.4;
            let y = sin(angle) * height * 0.35;
            enemies.push(new Enemy(i, mapX(x), mapY(y), x, y, groupIconSize));
        }
      }
    }
}

function mapSolidX (x){
  //map x coordinate for solid mode from background image's range to canvas size
  let mappedX = map(x, 0, bgMap.width, 0, width);
  return mappedX;
}

function mapSolidY (y){
  //map y coordinate for solid mode from background image's range to canvas size
  let mappedY = map(y, 0, bgMap.height, 0, height);
  return mappedY;
}

function reverseMapX(x) {
  //convert coordinates from p5js coordinates of origin in the top left corner to a coordinate system with centered origin
    let mappedX = map(x, 0, width, -width / 2, width / 2);
    return mappedX;
}
function reverseMapY(y) {
  //convert coordinates from p5js coordinates of origin in the top left corner to a coordinate system with centered origin
    let mappedY = map(y, 0, height, height / 2, -height / 2) - 10;
    return mappedY;
}
