import { _decorator, Component, Label, Sprite, SpriteAtlas, SpriteFrame } from 'cc';
import { ENEMY_INTENT } from '../../core/data/EnemyDefinitions';
const { ccclass, property } = _decorator;

@ccclass('IntentIcon')
export class IntentIcon extends Component {
    @property(Sprite) public iconSprite: Sprite;
    @property(Label) public valueLabel: Label;
    @property(SpriteAtlas) public intentAtlas: SpriteAtlas;

    /**
     * Инициализация иконки конкретным действием
     */
    public init(intent: ENEMY_INTENT, value?: number) {
        this.iconSprite.spriteFrame = this.intentAtlas.getSpriteFrame(`${intent}`);
        this.valueLabel.string = value > 0 ? value.toString() : "";
    }
}