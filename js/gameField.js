let tombStone;
function preload(){
    tombStone = loadImage('img/tombStone.png');
}

function setup() {
    let gameField = createCanvas(0.59 * $(window).width(), 0.67 * $(window).height());
    gameField.parent('gameCanvas');
    background(125);
    imageMode(CENTER);
    rectMode(CENTER);
    textAlign(CENTER,CENTER);
    ellipseMode(RADIUS);
    setTimeout(function () {
        console.log(groupId);
        createPlayers(groupId);
    },1000);
    frameRate(5);
}

function draw() {
    background(255);
    stroke(0);
    strokeWeight(1);
    noFill();
    ellipse(mapX(0), mapY(0), width * 0.4, height * 0.35);

    strokeWeight(2);
    if(typeof player != "undefined") {
        player.draw(0, height * 0.35);
    }
    for(let enemy of enemies){
        if( enemy != "") {
            enemy.draw();
            //enemy.checkDead(x,y);
        }

    }

}



function mapX(x) {
    let mappedX = map(x, -width / 2, width / 2, 0, width);
    return mappedX;
}

function mapY(y) {
    let mappedY = map(y+20, height / 2, -height / 2, 0, height);
    return mappedY;
}