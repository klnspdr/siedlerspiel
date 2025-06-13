function preload() {
    tombStone = loadImage('img/tombStone.png');
    bgMap = loadImage('img/backgrounds/map25.png');
    skull = loadImage('img/skull.svg');
    for (let itemNum = 1; itemNum <= config['number_items']; itemNum++) {
        itemIcons.push(loadImage(config['icon_file_dir'] + config['item' + itemNum]['icon_file_name']));
    }
    if (typeof config != "undefined") {
        for (let groupNum = 1; groupNum <= config['number_groups']; groupNum++) {
            groupIcons.push(loadImage(config['group_icon_dir'] + config['group_images']['files']['gr' + groupNum]))
            groupPositions.push(config['group_positions']['gr' + groupNum]);
        }
    }
    groupIconSize = config['group_images']['size'];
}

function setup() {
    //setup game field
    let gameField;
    if(groupId === 100){
        gameField = createCanvas(0.73 * $(window).width(), 0.75 * $(window).height());
    } else {
        gameField = createCanvas(0.59 * $(window).width(), 0.66 * $(window).height());
    }
    gameField.parent('gameCanvas');
    //background(125);
    //background('rgba(0, 255, 0, 0.25)')
    //clear();
    imageMode(CENTER);
    rectMode(CENTER);
    textAlign(CENTER, CENTER);
    ellipseMode(RADIUS);
    setTimeout(function () {
        createPlayers(groupId);
    }, 1000);
    frameRate(15);
}

function draw() {
    //background(255);
    //clear();
    //erase()
    //rect(0,0,width,height)
    //noErase()
    background('rgba(0, 0, 0, 0)')
    imageMode(CORNER);
    image(bgMap, 0, 0, width, height);
    imageMode(CENTER);
    stroke(0);
    strokeWeight(1);
    noFill();
    //ellipse(mapX(0), mapY(0), width * 0.4, height * 0.35);

    strokeWeight(2);

    for (let enemy of enemies) {
        if (enemy != "") {
            if (selectMode) {
                //select Enemy group for action by clicking on them
                if (wholeGroupData[enemy.groupId - 1]['hp'] != 0) {
                    enemy.selectMode();
                   /* noFill();
                    stroke('#ff0000');
                    strokeWeight(5);
                    rect(enemy.x, enemy.y, 60, 60);*/

                    if (mouseIsPressed && mouseX >= enemy.x - 45 && mouseX <= enemy.x + 45 && mouseY >= enemy.y - 31 && mouseY <= enemy.y + 31) {
                        $.get("ajax/runAction.php", {
                            groupId: groupId,
                            action: 'action' + currentAction,
                            targetId: enemy.groupId
                        })
                            .done(function (data) {

                                if (data != 1) {
                                    if(data.slice(-1) === "1"){
                                        data = data.slice(0, -1);
                                    }
                                    alert(data);
                                } else if (data == 1 && currentAction === 3){
                                    enemy.statsRevealed = true;
                                    setTimeout((enemy) => {
                                        enemy.statsRevealed = false;
                                    }, 60000, enemy)
                                }

                            });
                        selectMode = false;
                        setTimeout(function () {
                            invModeGroup = 0;
                        },70);

                    }
                } else {
                    tint(80);
                    image(tombStone, enemy.x, enemy.y, 50, 50);
                    enemy.drawName();
                    noTint();
                    enemy.updateShownInfo();

                }
            } else {
                enemy.draw();
            }

            if (enemy.groupId === invModeGroup) {
                enemy.showInventory();
            }

        }

    }
    if (selectMode) {
        fill(0);
        noStroke();
        textSize(30)
        text('Wen wollt ihr angreifen?', mapX(0), mapY(0));
        noFill();
        stroke('#ff0000');
        strokeWeight(5);
        rect(mapX(0), mapY(-10), width, height);
    }

    if (typeof player != "undefined") {

        player.draw();

    }

}

function mouseClicked() {
    if(!selectMode) {
        if (invModeGroup === 0) {
            for (let enemy of enemies) {
                if (enemy != "") {
                    if (mouseX >= enemy.x - 45 && mouseX <= enemy.x + 45 && mouseY >= enemy.y - 31 && mouseY <= enemy.y + 31) {
                        invModeGroup = enemy.groupId;
                    }
                }
            }
        } else {
            invModeGroup = 0;
        }
    }
}

function touchStarted() {

    if (invModeGroup === 0) {
        for (let enemy of enemies) {
            if (enemy != "") {
                if (touches.x >= enemy.x - 30 && touches.x <= enemy.x + 30 && touches.y >= enemy.y - 30 && touches.y <= enemy.y + 30) {
                    invModeGroup = enemy.groupId;
                    //console.log(invModeGroup + 'inv');
                }
            }
        }
    } else {
        invModeGroup = 0;
        //console.log(invModeGroup + 'inv');
    }
}


function mapX(x) {
  //convert coordinates from a centered origin to the p5js coordinates of origin in the top left corner
    let mappedX = map(x, -width / 2, width / 2, 0, width);
    return mappedX;
}

function mapY(y) {
  //convert coordinates from a centered origin to the p5js coordinates of origin in the top left corner
    let mappedY = map(y + 10, height / 2, -height / 2, 0, height);
    return mappedY;
}
