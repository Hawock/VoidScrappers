import { _decorator, Component, Sprite, SpriteAtlas, Label, UIOpacity, SpriteFrame, Node, Vec3 } from 'cc';
import { UserModule } from './classess/module';
import { RARITY } from '../config/module.enum';
const { ccclass, property } = _decorator;

@ccclass('ModuleDragItem')
export class ModuleDragItem extends Component {
    @property(SpriteAtlas) framesAtlas: SpriteAtlas = null!;
    
    @property(Sprite) rarityBg: Sprite = null!;
    @property(Sprite) iconSprite: Sprite = null!;

    public init(data: UserModule) {
        // 1. Включаем ноды, если они были выключены
        if (this.rarityBg) this.rarityBg.node.active = true;
        if (this.iconSprite) this.iconSprite.node.active = true;

        // 2. Рамка редкости
        const rarityKey = (data.rarity || 'STARTER').toLowerCase();
        const frame = this.framesAtlas.getSpriteFrame(rarityKey);
        if (frame && this.rarityBg) {
            this.rarityBg.spriteFrame = frame;
        }
    }

    public setIcon(spriteFrame: SpriteFrame | null) {
        console.log("YYODFHG")
        if (this.iconSprite) {
            this.iconSprite.spriteFrame = spriteFrame;
            this.iconSprite.node.active = true; // Убедимся, что нода иконки включена
        }

        // Безопасно меняем прозрачность
        let op = this.getComponent(UIOpacity);
        if (!op) op = this.node.addComponent(UIOpacity);
        op.opacity = 200; 

        // Убедимся, что масштаб не нулевой
        this.node.setScale(new Vec3(1.2, 1.2, 1)); 
    }
}