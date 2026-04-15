import { _decorator, Component, Node, Sprite, SpriteAtlas } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('VanguardSlot')
export class VanguardSlot extends Component {
    @property(Sprite) bgSprite: Sprite = null!;      
    @property(SpriteAtlas) slotAtlas: SpriteAtlas = null!; 

    private _type: string = "weapon"; // Храним тип строкой в нижнем регистре

    public initSlot(type: string) {
        this._type = type.toLowerCase(); 
        this.updateVisual(false); 
    }

    public updateVisual(isFilled: boolean) {
        const frameName = isFilled ? `${this._type}-filled` : this._type;
        const frame = this.slotAtlas.getSpriteFrame(frameName);
        if (frame) {
            this.bgSprite.spriteFrame = frame;
        } else {
            console.error(`Спрайт ${frameName} не найден в атласе!`);
        }
    }
}