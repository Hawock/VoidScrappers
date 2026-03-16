import { _decorator, Component, Label, Node, ProgressBar, Sprite, SpriteAtlas } from 'cc';
import { Player, SPACE_SHIP_BASE_STATS } from '../../core';
import { useBattleStore } from '../../store/BattleStore'; // Импортируем наш стор

const { ccclass, property } = _decorator;

@ccclass('PlayerView')
export class PlayerView extends Component {
    @property(Node) public UiContainer: Node;
    @property(Label) public playerNameLabel: Label;
    @property(Label) public currentHpLabel: Label;
    @property(Label) public maxHpLabel: Label;
    @property(Label) public shieldLabel: Label;
    @property(ProgressBar) public hpBar: ProgressBar;
    @property(SpriteAtlas) public playerAtlas: SpriteAtlas;
    @property(Sprite) public playerSprite: Sprite;
    public uid: number = 0;
    private _player: Player = null;

    initPlayer(player: Player) {
        this._player = player;
        this.uid = player.uid;
        // 1. Устанавливаем имя и картинку корабля (теперь shipType!)
        this.playerNameLabel.string = player.name;
        this.playerSprite.spriteFrame = this.playerAtlas.getSpriteFrame(player.shipType);

        // 2. Если это не наш игрок, скрываем UI (как и было)
        if (!player.isMyPlayer) this.hideUi();

        // 3. ПЕРВАЯ отрисовка статов
        this.updateUI();

        // 4. Подписка на изменения (если мы используем PinaColada для всего массива игроков)
        // В идеале мы подписываемся на изменения в BattleStore, 
        // но для начала просто вызываем updateUI при инициализации.
    }

    /**
     * Теперь берем всё напрямую из объекта Player (наследника Unit)
     */
    public updateUI() {
        if (!this._player) return;

        this.maxHpLabel.string = this._player.maxHp.toString();
        this.currentHpLabel.string = this._player.currentHp.toString();
        this.shieldLabel.string = this._player.shield.toString();
        this.hpBar.progress = this._player.currentHp / this._player.maxHp;
    }

    hideUi() {
        this.UiContainer.active = false;
    }
}