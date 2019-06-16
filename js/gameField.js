function preload() {
    tombStone = loadImage('img/tombStone.png');
    bgMap = loadImage('img/backgrounds/map.svg');
    skull = loadImage('img/skull.svg');
    for (let itemNum = 1; itemNum <= config['number_items']; itemNum++) {
        itemIcons.push(loadImage(config['icon_file_dir'] + config['item' + itemNum]['icon_file_name']));
    }
    if (typeof config != "undefined") {
        for (let groupNum = 1; groupNum <= config['number_groups']; groupNum++) {
            groupIcons.push(loadImage(config['group_icon_dir'] + config['group_images']['gr' + groupNum]))
        }
    }
}

function setup() {
    let gameField = createCanvas(0.59 * $(window).width(), 0.67 * $(window).height());
    gameField.parent('gameCanvas');
    background(125);
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
    background(255);
    imageMode(CORNER);
    image(bgMap, 0, 0, width, width);
    imageMode(CENTER);
    stroke(0);
    strokeWeight(1);
    noFill();
    ellipse(mapX(0), mapY(0), width * 0.4, height * 0.35);

    strokeWeight(2);

    for (let enemy of enemies) {
        if (enemy != "") {
            if (selectMode) {

                if (wholeGroupData[enemy.groupId - 1]['hp'] != 0) {
                    enemy.selectMode();
                    noFill();
                    stroke('#ff0000');
                    strokeWeight(5);
                    rect(enemy.x, enemy.y, 60, 60);

                    if (mouseIsPressed && mouseX >= enemy.x - 30 && mouseX <= enemy.x + 30 && mouseY >= enemy.y - 30 && mouseY <= enemy.y + 30) {
                        $.get("ajax/runAction.php", {
                            groupId: groupId,
                            action: 'action' + currentAction,
                            targetId: enemy.groupId
                        })
                            .done(function (data) {
                                if (data != 1) {
                                    alert(data);


                                }

                            });
                        selectMode = false;
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
    if (invModeGroup === 0) {
        for (let enemy of enemies) {
            if (enemy != "") {
                if (mouseX >= enemy.x - 30 && mouseX <= enemy.x + 30 && mouseY >= enemy.y - 30 && mouseY <= enemy.y + 30) {
                    invModeGroup = enemy.groupId;
                }
            }
        }
    } else {
        invModeGroup = 0;
    }
}

function touchStarted() {
    console.log('touched');
    if (invModeGroup === 0) {
        for (let enemy of enemies) {
            if (enemy != "") {
                if (touches.x >= enemy.x - 30 && touches.x <= enemy.x + 30 && touches.y >= enemy.y - 30 && touches.y <= enemy.y + 30) {
                    invModeGroup = enemy.groupId;
                    console.log(invModeGroup + 'inv');
                }
            }
        }
    } else {
        invModeGroup = 0;
        console.log(invModeGroup + 'inv');
    }
}


function mapX(x) {
    let mappedX = map(x, -width / 2, width / 2, 0, width);
    return mappedX;
}

function mapY(y) {
    let mappedY = map(y + 10, height / 2, -height / 2, 0, height);
    return mappedY;
}
