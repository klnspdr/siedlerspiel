let tombStone;
let bgMap;

function preload() {
    tombStone = loadImage('img/tombStone.png');
    bgMap = loadImage('img/backgrounds/map.svg');
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
    image(bgMap,mapX(0),mapY(-50),width,width);
    stroke(0);
    strokeWeight(1);
    noFill();
    ellipse(mapX(0), mapY(0), width * 0.4, height * 0.35);

    strokeWeight(2);
    if (typeof player != "undefined") {

            player.draw(0, height * 0.35);

    }
    for (let enemy of enemies) {
        if (enemy != "") {
            if (selectMode) {
                enemy.selectMode();
                noFill();
                stroke('#ff0000');
                strokeWeight(5);
                rect(enemy.x,enemy.y,60,60);
                if(mouseIsPressed && mouseX >= enemy.x - 30 && mouseX <= enemy.x + 30 && mouseY >= enemy.y - 30 && mouseY <= enemy.y + 30){
                    $.get("ajax/runAction.php", {groupId: groupId, action: 'action'+currentAction, targetId: enemy.groupId})
                        .done(function(data){
                            if(data != 1) {
                                alert(data);



                            }

                        });
                    selectMode = false;
                    console.log('Target selected');
                }
            } else {
                enemy.draw();
            }
        }

    }

}


function mapX(x) {
    let mappedX = map(x, -width / 2, width / 2, 0, width);
    return mappedX;
}

function mapY(y) {
    let mappedY = map(y + 20, height / 2, -height / 2, 0, height);
    return mappedY;
}
