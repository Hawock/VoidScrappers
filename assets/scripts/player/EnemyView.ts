import { _decorator, Component, instantiate, Label, Node, Prefab, ProgressBar, Sprite, SpriteAtlas } from 'cc';
import { Enemy } from '../../core';
import { IntentIcon } from '../ui/IntentIcon';
import { BATTLE_EVENT, battleBus } from '../event-bus/BatleBus';
const { ccclass, property } = _decorator;

@ccclass('EnemyView')
export class EnemyView extends Component {
    @property(Node) public UiContainer: Node;
    @property(Label) public enemyNameLabel: Label;
    @property(Label) public currentHpLabel: Label;
    @property(Label) public maxHpLabel: Label;
    @property(Label) public shieldLabel: Label;
    @property(ProgressBar) public hpBar: ProgressBar;
    @property(SpriteAtlas) public enemyAtlas: SpriteAtlas;
    @property(Sprite) public enemySprite: Sprite;
    @property(Node) public intentContainer: Node;
    @property(Prefab) public intentIconPrefab: Prefab;
    public uid: number = 0;
    private _enemy: Enemy = null;

    initEnemy(enemy: Enemy) {
        this._enemy = enemy;
        this.uid = enemy.uid;
        // 1. Устанавливаем имя и картинку корабля (теперь shipType!)
        this.enemyNameLabel.string = enemy.name;
        this.enemySprite.spriteFrame = this.enemyAtlas.getSpriteFrame(enemy.spriteFrame);
        this.updateUI();
        this.updateIntent();
    }

    onEnable() {
        // Подписываемся на событие обновления любого юнита
        battleBus.on(BATTLE_EVENT.UNIT_UPDATED, this.onUnitUpdated, this);
    }

    onDisable() {
        // Обязательно отписываемся, чтобы не было утечек памяти
        battleBus.off(BATTLE_EVENT.UNIT_UPDATED, this.onUnitUpdated, this);
    }

    private onUnitUpdated(payload: { uid: number }) {
        console.log("EnemyView received UNIT_UPDATED for uid:", payload.uid, "own uid:", this.uid);
        if (payload.uid === this.uid) {
            this.updateUI();
            this.updateIntent();
        }
    }

    public updateUI() {
        if (!this._enemy) return;
        this.maxHpLabel.string = this._enemy.maxHp.toString();
        this.currentHpLabel.string = this._enemy.currentHp.toString();
        this.shieldLabel.string = this._enemy.shield.toString();
        this.hpBar.progress = this._enemy.currentHp / this._enemy.maxHp;
    }

    public updateIntent() {
        if (!this._enemy) return;
        this.intentContainer.removeAllChildren();
        this._enemy.nextActions.forEach(action => {
            const iconNode = instantiate(this.intentIconPrefab);
            iconNode.parent = this.intentContainer;
            const iconComp = iconNode.getComponent(IntentIcon);
            if (iconComp) {
                iconComp.init(action.intent, action.value);
            }
        });
    }
}


