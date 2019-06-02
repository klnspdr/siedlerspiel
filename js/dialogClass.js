class Dialog{

    constructor(type){
        this.dialogType = type; //0: Error; 1: Success; 2: Confirm?
    }

    draw(){
        if(this.dialogType === 0){
            noStroke();
            fill('#ff0000', 125);
            rect(mapX(0), mapY(0), width, height);
        }
    }
}