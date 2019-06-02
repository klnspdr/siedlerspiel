function setup(){
    let gameField = createCanvas(0.59 * $(window).width(),0.67 * $(window).height());
    gameField.parent('gameCanvas');
    background(125);
    rectMode(CENTER);
}
function draw(){
    fill(0);
    rect(mapX(0), mapY(0), 100, 100);
    drawAlert();
}

function drawAlert( ) {
    noStroke();
    fill(255, 0, 0, 50);
    rect(mapX(0), mapY(0), width, height);
}

function drawConfirm() {

}

function mapX(x) {
   let mappedX =  map(x, -width/2, width/2, 0, width);
    return mappedX;
}

function mapY(y) {
    let mappedY =  map(y, height/2, -height/2, 0, height);
    return mappedY;
}