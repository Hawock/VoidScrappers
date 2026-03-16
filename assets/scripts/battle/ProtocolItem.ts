import { _decorator, Component, Label, Button, Sprite, Color } from 'cc';
import { IProtocol } from '../../core';
import { useBattleStore } from '../../store/BattleStore';
import { BATTLE_EVENT, battleBus } from '../event-bus/BatleBus';

const { ccclass, property } = _decorator;

@ccclass('ProtocolItem')
export class ProtocolItem extends Component {
    @property(Label) titleLabel: Label = null!;
    @property(Label) costLabel: Label = null!;
    @property(Label) descriptionLabel: Label = null!;
    @property(Label) typeProtocolLabel: Label = null!;
@   property(Button) activationButton: Button = null!;
    private _data: IProtocol = null!;
    private _store = useBattleStore();

    public init(data: IProtocol) {
        this._data = data;
        // Заполняем визуал
        this.titleLabel.string = data.name;
        this.costLabel.string = data.cost.toString();
        this.descriptionLabel.string = data.description;
        this.typeProtocolLabel.string = data.type;

        // Если энергии не хватает — можно сразу задизейблить кнопку
        // Но это логику лучше вынести в отдельный метод проверки
        this.updateAvailability();
    }

    /**
     * Проверяем, может ли игрок сейчас использовать этот протокол
     */
    updateAvailability() {
        // Находим локального игрока в Сторе
        const myPlayer = this._store.players.value.find(p => p.isMyPlayer);
        if (!myPlayer) return;

        const hasEnoughEnergy = myPlayer.currentEnergy >= this._data.cost;
        
        // 1. Управляем кликабельностыю кнопки
        
        this.activationButton.interactable = hasEnoughEnergy;

        // 2. Визуальный фидбек (например, затемнение)
        const sprite = this.getComponent(Sprite);
        if (sprite) {
            sprite.color = hasEnoughEnergy ? Color.WHITE : Color.GRAY;
        }
    }

    onProtocolClick() {
        // Еще раз проверяем на всякий случай
        const myPlayer = this._store.players.value.find(p => p.isMyPlayer);
        if (myPlayer && myPlayer.currentEnergy >= this._data.cost) {
            console.log(`🚀 Активируем: ${this._data.name}`);
            
            // Кидаем событие в шину
            battleBus.emit(BATTLE_EVENT.TRY_PLAY_PROTOCOL, this._data);
        }
    }
}