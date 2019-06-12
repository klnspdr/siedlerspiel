class Group {
    constructor(groupId) {
        this.groupId = groupId;
    }

    draw(x, y) {
        let mx = mapX(x);
        let my = mapY(y);
        strokeWeight(2);
        fill(200);
        ellipse(mx, my, 20, 20);
        textSize(20);
        fill(0);
        text(this.groupId, mx, my);
        this.updateShownInfo(mx, my);
    }

    updateShownInfo(x, y) {
        //console.log(wholeGroupData);
        if (wholeGroupData != null && wholeInv != null) {
            let info = wholeGroupData[this.groupId - 1];
            let inv = wholeInv[this.groupId - 1];
            strokeWeight(0);
            textSize(10);
            text(info['score'], x, y + 50);
            this.drawHpBar(x, y, info['hp'], info['max_hp']);
        }
    }

    drawHpBar(x, y, hp, maxHp) {
        rect(x, y + 25, 50, 10);
        strokeWeight(1);
        fill(255);
        let filledLength = 50 * hp/maxHp;
        rect(x-filledLength/2,y+25,filledLength,10);
    }

}

class Enemy extends Group {
    log() {
        console.log(this.groupId);
    }

}

class Player extends Group {
    /* draw(x, y) {
         fill('#00ff00');
         ellipse(mapX(x), mapY(y), 20, 20);
         textSize(20);
         fill(0);
         text(this.groupId, mapX(x), mapY(y));
     }*/
}