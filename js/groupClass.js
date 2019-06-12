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
            text("Punkte: " + info['score'], x, y + 50);
            this.drawHpBar(x, y, info['hp'], info['max_hp']);
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
        text(hp + " / " + maxHp, x, y + 30)
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