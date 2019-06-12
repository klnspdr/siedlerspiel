class Group {
    constructor(groupId,x,y) {
        this.groupId = groupId;
        this.x = x;
        this.y = y;
    }

    draw() {

        stroke(0);
        strokeWeight(2);
        fill(config['group_colors']['gr'+this.groupId]);
        ellipse(this.x, this.y, 20, 20);
        textSize(20);
        fill(0);
        noStroke();
        textStyle(NORMAL);
        text(this.groupId, this.x, this.y);
        this.drawName();
    }

    drawName(){
        textStyle(BOLD);
        textSize(15);
        text(config['group_names']['gr'+this.groupId],this.x,this.y-30);
    }

    updateShownInfo() {
        //console.log(wholeGroupData);
        if (wholeGroupData != null && wholeInv != null) {
            let info = wholeGroupData[this.groupId - 1];
            let inv = wholeInv[this.groupId - 1];
            strokeWeight(0);
            textSize(10);
            textStyle(NORMAL);
            text("Punkte: " + info['score'], this.x, this.y + 50);
            this.drawHpBar(this.x, this.y, info['hp'], info['max_hp']);
        }
    }

    drawHpBar(x, y, hp, maxHp) {
        strokeWeight(1);
        stroke(0);
        fill(255);
        rect(x, y + 30, 50, 15);
        //strokeWeight(1);
        if (hp / maxHp >= 0.5) {
            fill('#00ff00');
        } else if (hp / maxHp > 0.15) {
            fill('#ffe300');
        } else {
            fill('#ff0000');
        }
        noStroke();
        let filledLength = 50 * (hp / maxHp);
        rect(x - (50 - filledLength) / 2 + 0.5, y + 30.5, filledLength - 1, 14);
        //noStroke();
        //rect(x-(50-filledLength)/2+)
        fill(0);
        textSize(10);
        textStyle(NORMAL);
        text(hp + " / " + maxHp, x, y + 30)
    }

}

class Enemy extends Group {
    log() {
        console.log(this.groupId);
    }

    draw(){

        if (parseInt(wholeGroupData[this.groupId - 1]['hp']) === 0) {
            //fill('#ff0000aa');
            image(tombStone,this.x,this.y,50,50);
            super.drawName();
        } else {
            super.draw();

        }
        super.updateShownInfo(this.x,this.y);

    }
}

class Player extends Group {
   draw(){
       super.draw();
       super.updateShownInfo(this.x,this.y);
   }
}