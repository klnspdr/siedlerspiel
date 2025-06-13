class Group {
    constructor(groupId, x, y, ux, uy, iconSize) {
        this.groupId = groupId;
        this.x = x;
        this.y = y;
        this.unMapX = ux;
        this.unMapY = uy;
        this.iconSize = iconSize;
        this.statsShown = true;
        this.statsRevealed = false;
        this.nameTextColor = config.group_colors.nameText['gr' + this.groupId]
        if(this.iconSize.conserve){
            console.log(`group: ${this.groupId}`);
            console.log(`fileWidth: ${groupIcons[this.groupId-1].width}`);
            this.iconSize.x = groupIcons[this.groupId-1].width/bgMap.width * width;
            console.log(`calculated width: ${this.iconSize.x}`)
            this.iconSize.y = groupIcons[this.groupId-1].height/bgMap.height * height;
        }
    }

    draw() {
        image(groupIcons[this.groupId-1],this.x,this.y,this.iconSize.x,this.iconSize.y);
        this.drawName();
    }

    drawName() {
        textFont("Asterix");
        noStroke();
        fill(this.nameTextColor);
        textStyle(BOLD);
        textSize(15);
        text(config['group_names']['gr' + this.groupId], this.x, this.y - this.iconSize.y/2 - 10);
    }

    updateShownInfo() {
        if (wholeGroupData != null && wholeInv != null) {


            let info = wholeGroupData[this.groupId - 1];
            fill(0);
            strokeWeight(0);
            textSize(15);
            textStyle(NORMAL);
			if(info['displayScore'] == true)
            text("Punkte: " + info['final_score'], this.x, this.y + this.iconSize.y / 2 + 30);

            this.drawHpBar(info['hp'], info['max_hp']);
        }
    }

    drawHpBar(hp, maxHp) {
        strokeWeight(1);
        stroke(0);
        fill(255);
        rect(this.x, this.y + this.iconSize.y / 2 + 10, 50, 15);
        if(!this.statsShown){
            hp = 0;
        }
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
        rect(this.x - (50 - filledLength) / 2 + 0.5, this.y + this.iconSize.y / 2 + 10.5, filledLength - 1, 14);
        //noStroke();
        //rect(x-(50-filledLength)/2+)
        if(!this.statsShown){
            hp = "?";
        }
        fill(0);
        textSize(12);
        textStyle(NORMAL);
        text(hp + " / " + maxHp, this.x, this.y + this.iconSize.y / 2 + 10)
    }

}

class Enemy extends Group {
    log() {
    }

    draw() {
        if (wholeGroupData != null && wholeInv != null) {

            if(wholeInv[this.groupId - 1][config.item_hiding_inventory] >= 1 && !this.statsRevealed ){
                this.statsShown = false;
            } else {
                this.statsShown = true;
            }
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

        super.updateShownInfo(this.x, this.y);
    }

    showInventory() {
        fill(255);
        stroke(0);
        strokeWeight(1);
        if (wholeInv != null) {
            let groupInv = wholeInv[this.groupId - 1];
            let numberRows = Math.ceil(config['number_items'] / 6);
            if ((config.groupPositioning === "fluid" && (this.y <= height / 2 || (this.x >= mapX(0) - 1 && this.x <= mapX(0) + 1))) || (config.groupPositioning === "solid" && config.inventoryDirections["gr" + this.groupId] === "up")) {
              console.log("up");
                rect(this.x - this.unMapX / (0.01 * width), this.y - 96, 180, 120);
                noStroke();
                triangle(this.x, this.y - 10, this.x - 10, this.y - 37, this.x + 10, this.y - 37);
                stroke(0);
                line(this.x,this.y-10,this.x-10,this.y-35);
                line(this.x,this.y-10,this.x+10,this.y-35);


                let itemNum = 1;
                for (let row = 0; row < numberRows; row++) {
                    for (let col = 1; col <= 5; col++) {
                        let x = this.x - this.unMapX / (0.01 * width) - 74 + 35 * (col - 1);
                        let y = this.y - 136 + 27 * (row);
                        if (itemNum <= config['number_items']) {
                            if (config['item' + itemNum]['visible_for_others'] == false) {
                                itemNum++;
                            }
                            image(itemIcons[itemNum - 1], x, y, 20, 20);
                            noStroke();
                            fill(0);
                            textStyle(NORMAL);
                            text(": " + ((this.statsShown) ? groupInv['item' + itemNum] : "?"), x + 15, y);

                            itemNum++;
                        }
                    }
                }
            } else {
                rect(this.x - this.unMapX / (0.01 * width), this.y + 120, 180, 120);
                noStroke();
                triangle(this.x, this.y + 10, this.x - 10, this.y + 62, this.x + 10, this.y + 62);
                stroke(0);
                line(this.x,this.y+10,this.x-10,this.y+59);
                line(this.x,this.y+10,this.x+10,this.y+59);

                let itemNum = 1;
                for (let row = 0; row < numberRows; row++) {
                    for (let col = 1; col <= 5; col++) {
                        let x = this.x - this.unMapX / (0.01 * width) - 74 + 35 * (col - 1);
                        let y = this.y + 80 + 27 * (row);
                        if (itemNum <= config['number_items']) {
                            if (config['item' + itemNum]['visible_for_others'] == false) {
                                itemNum++;
                            }
                            image(itemIcons[itemNum - 1], x, y, 20, 20);
                            noStroke();
                            fill(0);
                            textStyle(NORMAL);
                            text(": " + ((this.statsShown) ? groupInv['item' + itemNum] : "?"), x + 15, y);
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
            if(selectMode){
                tint(80);
                image(groupIcons[this.groupId-1],this.x,this.y,this.iconSize.x,this.iconSize.y);
                noTint();
                super.drawName();

            } else {


                super.draw();
            }

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