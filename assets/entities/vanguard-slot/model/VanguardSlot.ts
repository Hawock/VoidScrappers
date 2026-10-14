// VanguardSlot.ts
import { _decorator, Component, Node, Sprite, SpriteAtlas, UIOpacity } from 'cc';
import { ModuleItem } from '../../module/model/ModuleItem';
const { ccclass, property } = _decorator;

@ccclass('VanguardSlot')
export class VanguardSlot extends Component {   
    @property(SpriteAtlas) slotIconAtlas: SpriteAtlas = null!; 
    @property(Node) moduleContainer: Node = null!;
    @property(Sprite) slotTypeIcon: Sprite = null!;
    @property(Number)
    displayOrder: number = 0; 

    slotId: string = "";
    slotType: string = "weapon"; 

    public initSlot(type: string, id: string) {
        this.slotType = type.toLowerCase(); 
        this.slotId = id;
        this.updateVisual(); 
    }

    public addModule(moduleNode: Node) {
        this.clear();
        moduleNode.parent = this.moduleContainer || this.node;
        moduleNode.setPosition(0, 0, 0);
        moduleNode.getComponent(ModuleItem).typeSprite.node.active = false;
        this.updateVisual();
    }

    public clear() {
        const container = this.moduleContainer || this.node;
        container.removeAllChildren();
        this.updateVisual();
    }

    public updateVisual() {
        if (!this.slotIconAtlas) return;
        const frameName = `${this.slotType}-icon`;
        const frame = this.slotIconAtlas.getSpriteFrame(frameName);
        if (frame) this.slotTypeIcon.spriteFrame = frame;
    }

    public canAccept(moduleType: string): boolean {
        return this.slotType === moduleType.toLocaleLowerCase();
    }

    public setHighlightState(isSuitable: boolean, isDragging: boolean) {
        let opacity = this.getComponent(UIOpacity);
        if (!opacity) opacity = this.node.addComponent(UIOpacity);

        if (!isDragging) {
            // Возвращаем в нормальное состояние
            opacity.opacity = 255;
            // Если есть рамка, можно убрать свечение
            return;
        }

        if (isSuitable) {
            opacity.opacity = 255; // Подходящий слот яркий
            // Тут можно добавить код для включения "свечения" или изменения цвета рамки
        } else {
            opacity.opacity = 60;  // Неподходящий слот затемняем
        }
    }
}