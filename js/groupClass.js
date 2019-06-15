class Group {
    constructor(groupId, x, y, ux, uy) {
        this.groupId = groupId;
        this.x = x;
        this.y = y;
        this.unMapX = ux;
        this.unMapY = uy;
    }

    draw() {

        stroke(0);
        strokeWeight(2);
        fill(config['group_colors']['gr' + this.groupId]);
        ellipse(this.x, this.y, 20, 20);
        textSize(20);
        fill(0);
        noStroke();
        textStyle(NORMAL);
        text(this.groupId, this.x, this.y);
        this.drawName();
    }

    drawName() {
        textStyle(BOLD);
        textSize(15);
        text(config['group_names']['gr' + this.groupId], this.x, this.y - 30);
    }

    updateShownInfo() {
        if (wholeGroupData != null && wholeInv != null) {
            let info = wholeGroupData[this.groupId - 1];
            let inv = wholeInv[this.groupId - 1];
            fill(0);
            strokeWeight(0);
            textSize(10);
            textStyle(NORMAL);
			if(info['displayScore'] == true)
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
    }

    draw() {
        if (wholeGroupData != null) {
            if (parseInt(wholeGroupData[this.groupId - 1]['hp']) === 0) {
                //fill('#ff0000aa');
                image(tombStone, this.x, this.y, 50, 50);
                super.drawName();
            } else {
                super.draw();

            }
            super.updateShownInfo(this.x, this.y);
        }
    }

    selectMode() {
        super.draw();
        noFill();
        stroke('#ff0000');
        strokeWeight(5);
        rect(mapX(0), mapY(-20), width, height);
        super.updateShownInfo(this.x, this.y);
    }

    showInventory() {
        fill(255);
        stroke(0);
        strokeWeight(1);
        if (wholeInv != null) {
            let groupInv = wholeInv[this.groupId - 1];
            let numberRows = Math.ceil(config['number_items'] / 6);
            if (this.y <= height / 2 || (this.x >= mapX(0) - 1 && this.x <= mapX(0) + 1)) {
                rect(this.x - this.unMapX / (0.01 * width), this.y - 80, 220, 90);
                noStroke();
                triangle(this.x, this.y - 10, this.x - 10, this.y - 37, this.x + 10, this.y - 37);
                stroke(0);
                line(this.x,this.y-10,this.x-10,this.y-35);
                line(this.x,this.y-10,this.x+10,this.y-35);


                let itemNum = 1;
                for (let row = 0; row < numberRows; row++) {
                    for (let col = 1; col <= 6; col++) {
                        let x = this.x - this.unMapX / (0.01 * width) - 90 + 35 * (col - 1);
                        let y = this.y - 108 + 27 * (row);
                        if (itemNum <= config['number_items']) {
                            if (config['item' + itemNum]['visible_for_others'] == false) {
                                itemNum++;
                            }
                            image(itemIcons[itemNum - 1], x, y, 20, 20);
                            noStroke();
                            fill(0);
                            textStyle(NORMAL);
                            text(": " + groupInv['item' + itemNum], x + 15, y);

                            itemNum++;
                        }
                    }
                }
            } else {
                rect(this.x - this.unMapX / (0.01 * width), this.y + 104, 220, 90);
                noStroke();
                triangle(this.x, this.y + 10, this.x - 10, this.y + 62, this.x + 10, this.y + 62);
                stroke(0);
                line(this.x,this.y+10,this.x-10,this.y+59);
                line(this.x,this.y+10,this.x+10,this.y+59);

                let itemNum = 1;
                for (let row = 0; row < numberRows; row++) {
                    for (let col = 1; col <= 6; col++) {
                        let x = this.x - this.unMapX / (0.01 * width) - 90 + 35 * (col - 1);
                        let y = this.y + 78 + 27 * (row);
                        if (itemNum <= config['number_items']) {
                            if (config['item' + itemNum]['visible_for_others'] == false) {
                                itemNum++;
                            }
                            image(itemIcons[itemNum - 1], x, y, 20, 20);
                            noStroke();
                            fill(0);
                            textStyle(NORMAL);
                            text(": " + groupInv['item' + itemNum], x + 15, y);
                            itemNum++;
                        }
                    }
                }
            }

        }
    }

}

class Player extends Group {
    draw() {
        if (wholeGroupData != null) {

            super.draw();
            super.updateShownInfo(this.x, this.y);
            if (parseInt(wholeGroupData[this.groupId - 1]['hp']) === 0) {
                tint(255, 0, 0, 200);
                image(skull, width / 2, height / 2, height, height)
            } else {
                noTint();
            }
        }
    }


}
