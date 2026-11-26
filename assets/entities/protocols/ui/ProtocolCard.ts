import { _decorator, Component, Node, Sprite, SpriteAtlas, Label, RichText, isValid } from 'cc';

import { ProtocolEnt } from '../model/classess/protocol.ent';
import { RemoteImageLoader } from 'db://assets/shared/infra/remote-image-loader';

const { ccclass, property } = _decorator;

@ccclass('ProtocolCard')
export class ProtocolCard extends Component {
    // === НАСТРОЙКИ ===
    @property
    withDescription: boolean = true;

    // === ЕДИНЫЙ АТЛАС ===
    @property(SpriteAtlas) atlas: SpriteAtlas = null!;               // ProtocolAtlas.plist

    // === ЭЛЕМЕНТЫ КАРТОЧКИ ===
    @property(Sprite) frameSprite: Sprite = null!;               // FrameSprite
    @property(Sprite) typeBgSprite: Sprite = null!;              // ProtocolTypeFrame
    @property(Sprite) descBgSprite: Sprite = null!;              // DescriptionNode (Sprite)
    @property(Sprite) iconSprite: Sprite = null!;                // ProtocolSprite
    @property(Node) spinnerNode: Node = null!;
    @property(Sprite) typeSprite: Sprite = null!;                // TypeIcon
    @property(Label) nameLabel: Label = null!;                   // ProtocolTitleLabel
    @property(Label) typeLabel: Label = null!;                   // TypeLabel
    @property(Label) costLabel: Label = null!;                   // EnergyCostLabel
    @property(Node) descriptionNode: Node = null!;               // DescriptionNode
    @property(RichText) descriptionLabel: RichText = null!;      // DescriptionLabel

    public data: ProtocolEnt | null = null;

    public init(data: ProtocolEnt, withDescription?: boolean) {
        this.data = data;

        if (withDescription !== undefined) {
            this.withDescription = withDescription;
        }

        const rarity = (data.rarity || 'STARTER').toUpperCase();
        const rawType = (data.type || '').toUpperCase();

        // 1. Название протокола
        if (this.nameLabel) {
            this.nameLabel.string = data.name || '';
        }

        // 2. Все элементы из единого атласа
        if (this.atlas) {
            if (this.frameSprite) {
                const frame = this.atlas.getSpriteFrame(`protocols-frame-${rarity}`);
                if (frame) this.frameSprite.spriteFrame = frame;
            }
            if (this.typeBgSprite) {
                const typeBg = this.atlas.getSpriteFrame(`protocols-type-${rarity}`);
                if (typeBg) this.typeBgSprite.spriteFrame = typeBg;
            }
            if (this.descBgSprite) {
                const descBg = this.atlas.getSpriteFrame(`protocols-description-${rarity}`);
                if (descBg) this.descBgSprite.spriteFrame = descBg;
            }
            if (this.typeSprite) {
                const typeIcon = this.atlas.getSpriteFrame(`protocols-type-icon-${rawType}`);
                if (typeIcon) this.typeSprite.spriteFrame = typeIcon;
            }
        }

        // 3. Тип и стоимость
        if (this.typeLabel) {
            this.typeLabel.string = rawType;
        }
        if (this.costLabel) {
            this.costLabel.string = String(data.cost ?? 0);
        }

        // 4. Блок описания
        if (this.descriptionNode) {
            this.descriptionNode.active = this.withDescription;
        }
        if (this.withDescription && this.descriptionLabel) {
            this.descriptionLabel.string = this.data.richDescription;
        }

        // 5. Картинка протокола
        this.loadIcon(data.spriteFrame);
    }

    private async loadIcon(url: string | null) {
        if (!this.iconSprite) return;

        if (!url) {
            if (this.spinnerNode) this.spinnerNode.active = false;
            this.iconSprite.node.active = false;
            return;
        }

        if (this.spinnerNode) this.spinnerNode.active = true;
        this.iconSprite.node.active = false;

        const spriteFrame = await RemoteImageLoader.loadSprite(url);
        if (!isValid(this) || !this.node.activeInHierarchy) return;

        if (this.spinnerNode) this.spinnerNode.active = false;
        if (spriteFrame) {
            this.iconSprite.spriteFrame = spriteFrame;
            this.iconSprite.node.active = true;
        }
    }
}