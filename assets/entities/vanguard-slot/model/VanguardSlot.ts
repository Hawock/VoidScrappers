// VanguardSlot.ts
import { _decorator, Component, Node, Sprite, SpriteAtlas } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('VanguardSlot')
export class VanguardSlot extends Component {
    @property(Sprite) bgSprite: Sprite = null!;      
    @property(SpriteAtlas) slotAtlas: SpriteAtlas = null!; 
    @property(Node) moduleContainer: Node = null!;
    slotId: string = "";

    // --- ВОТ ЭТО НУЖНО ДОБАВИТЬ ---
    @property(Number)
    displayOrder: number = 0; 
    // ------------------------------

    private _type: string = "weapon"; 

    public initSlot(type: string, id: string) {
        this._type = type.toLowerCase(); 
        this.slotId = id;
        // Можно сохранить id слота из БД, если понадобится для запросов
        this.updateVisual(false); 
    }

    public addModule(moduleNode: Node) {
        this.clear();
        moduleNode.parent = this.moduleContainer || this.node;
        moduleNode.setPosition(0, 0, 0);
        this.updateVisual(true);
    }

    public clear() {
        const container = this.moduleContainer || this.node;
        container.removeAllChildren();
        this.updateVisual(false);
    }

    public updateVisual(isFilled: boolean) {
        if (!this.slotAtlas || !this.bgSprite) return;
        const frameName = isFilled ? `${this._type}-filled` : this._type;
        const frame = this.slotAtlas.getSpriteFrame(frameName);
        if (frame) this.bgSprite.spriteFrame = frame;
    }
}