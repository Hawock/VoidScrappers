import { _decorator, Component, Label, Node, Sprite, SpriteAtlas, math } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('VanguardItem')
export class VanguardItem extends Component {
    @property(Sprite) vanguardSprite: Sprite = null!;
    @property(SpriteAtlas) vanguardAtlas: SpriteAtlas = null!;
    @property(Label) vanguardLabel: Label = null!;

    public vanguardId: string = '';

    protected onLoad() {
        // Слушаем клик по самой ноде (всей карточке)
        this.node.on(Node.EventType.TOUCH_END, this.onSelectClick, this);
    }

    public init(vanguardId: string, vanguardName: string) {
        this.vanguardId = vanguardId;
        if (this.vanguardLabel) this.vanguardLabel.string = vanguardName;
        
        if (this.vanguardSprite && this.vanguardAtlas) {
             const frameName = `${vanguardName.toLocaleLowerCase()}_icon`;
             const spriteFrame = this.vanguardAtlas.getSpriteFrame(frameName);
             if (spriteFrame) {
                 this.vanguardSprite.spriteFrame = spriteFrame;
             } else {
                 console.warn(`Иконка ${frameName} не найдена в атласе!`);
             }
        }
        
        this.setSelected(false);
    }

    private onSelectClick() {
        // Как в рейдах: кричим наверх, что нас выбрали
        this.node.emit('vanguard-selected', this.vanguardId);
    }

    public setSelected(isSelected: boolean) {
        // Визуальная подсветка
        this.node.scale = isSelected ? new math.Vec3(1.05, 1.05, 1.05) : new math.Vec3(1, 1, 1);
        if (this.vanguardSprite) {
             this.vanguardSprite.color = isSelected ? math.Color.WHITE : math.Color.GRAY;
        }
    }
}