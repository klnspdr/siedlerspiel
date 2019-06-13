function preload() {
    tombStone = loadImage('img/tombStone.png');
    bgMap = loadImage('img/backgrounds/map.svg');
    skull = loadImage('img/skull.svg');
    for (let itemNum = 1; itemNum <= config['number_items']; itemNum++) {
        itemIcons.push(loadImage(config['icon_file_dir'] + config['item' + itemNum]['icon_file_name']));
    }
    console.log(itemIcons);
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
        console.log(groupId);
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
    //ellipse(mapX(0), mapY(0), width * 0.4, height * 0.35);

    strokeWeight(2);

    for (let enemy of enemies) {
        if (enemy != "") {
            if (selectMode) {
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
                    console.log('Target selected');
                }
            } else {
                enemy.draw();
            }

            if (enemy.groupId === invModeGroup) {
                enemy.showInventory();
            }

        }

    }


    if (typeof player != "undefined") {

        player.draw();

    }

}

function mouseClicked() {
    console.log('mouseClicked');
    if (invModeGroup === 0) {
        for (let enemy of enemies) {
            if (enemy != "") {
                if (mouseX >= enemy.x - 30 && mouseX <= enemy.x + 30 && mouseY >= enemy.y - 30 && mouseY <= enemy.y + 30) {
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
