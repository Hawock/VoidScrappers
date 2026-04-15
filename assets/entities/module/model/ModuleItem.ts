import { _decorator, Component, Node, Sprite, SpriteAtlas, Label, tween, Vec3, Color } from 'cc';
import { RARITY } from 'db://assets/widgets/inventory/config/module.enum';
import { IUserModule } from 'db://assets/widgets/inventory/types/IUSerModule';
const { ccclass, property } = _decorator;

@ccclass('ModuleItem')
export class ModuleItem extends Component {
    @property(SpriteAtlas) framesAtlas: SpriteAtlas = null!;

    @property(Sprite) rarityBg: Sprite = null!;
    @property(Sprite) protocolFrameSprite: Sprite = null!;
    @property(Sprite) countFrameSprite: Sprite = null!;

    @property(Sprite) icon: Sprite = null!;
    @property(Label) protocolLabel: Label = null!;
    @property(Label) countLabel: Label = null!;

    public data: IUserModule | null = null;
    private _isSelected = false;
    
    public init(data: IUserModule) {
        this.data = data;

        // 1. Установка рамок по Rarity
        // Теперь rarity — это строка-ключ из твоего Enum (STARTER, COMMON...)
        const rarityKey = data.rarity.toLowerCase();
        const frameSprite = this.framesAtlas.getSpriteFrame(rarityKey);

        if (frameSprite) {
            this.rarityBg.spriteFrame = frameSprite;
            this.protocolFrameSprite.spriteFrame = frameSprite;
            this.countFrameSprite.spriteFrame = frameSprite;
        }

        // 2. Установка иконки из статичных данных модуля
        // Используем spriteFrame из вложенного объекта module
        if (data.module && data.module.spriteFrame) {
            // Тут логика подгрузки иконки, например из атласа иконок:
            // this.icon.spriteFrame = iconsAtlas.getSpriteFrame(data.module.spriteFrame);
        }

        this.updateLabels();
    }

    private updateLabels() {
        if (!this.data) return;

        // Протоколы (Топ-лево)
        const pCount = this.data.unlockedProtocols?.length || 0;
        this.protocolFrameSprite.node.active = pCount > 0;
        this.protocolLabel.string = pCount.toString();

        // Бесконечность (Бот-райт)
        // Теперь проверяем, что редкость равна STARTER
        if (this.data.rarity === RARITY.STARTER) {
            this.countFrameSprite.node.active = true;
            this.countLabel.string = "∞";
        } else {
            this.countFrameSprite.node.active = false;
        }
    }
    /**
     * Визуальное выделение модуля без создания новых нод
     */
    public setSelection(isActive: boolean) {
        this._isSelected = isActive;

        // Останавливаем старые анимации
        tween(this.node).stop();

        if (isActive) {
            // Мягкая пульсация размера для эффекта выбора
            tween(this.node)
                .to(0.3, { scale: new Vec3(1.05, 1.05, 1) }, { easing: 'quadOut' })
                .to(0.3, { scale: new Vec3(1.0, 1.0, 1) }, { easing: 'quadIn' })
                .union()
                .repeatForever()
                .start();
        } else {
            // Возвращаем в исходное состояние
            this.node.setScale(new Vec3(1, 1, 1));
        }
    }
}