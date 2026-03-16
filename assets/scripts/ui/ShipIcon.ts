import { _decorator, Component, Node, Sprite, SpriteAtlas } from 'cc';
import { Player, SPACE_SHIPS } from '../../core';
const { ccclass, property } = _decorator;

@ccclass('ShipIcon')
export class ShipIcon extends Component {
    @property(SpriteAtlas) public shipAtlas: SpriteAtlas = null!
    @property(Sprite) public shipSprite: Sprite = null!
    uid: number = 0

    init(player: Player) {
        console.log(player);
        this.uid = player.uid;
        
        this.shipSprite.spriteFrame = this.shipAtlas.getSpriteFrame(`${player.shipType}_icon`);

    }

}


