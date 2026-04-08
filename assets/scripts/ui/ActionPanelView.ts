import { _decorator, Component, Prefab, instantiate } from 'cc';
import { useBattleStore } from '../../store/BattleStore';
import { BATTLE_EVENT, battleBus } from '../../shared/event-bus/BatleBus';
import { ProtocolItem } from '../battle/ProtocolItem';


const { ccclass, property } = _decorator;

@ccclass('ActionPanelView')
export class ActionPanelView extends Component {
    @property(Prefab) protocolPrefab: Prefab = null!;

    private _store = useBattleStore();

    onLoad() {
        // Подписываемся на обновление руки
        battleBus.on(BATTLE_EVENT.HAND_UPDATED, this.renderProtocols, this);
    }

    protected onDisable(): void {
        battleBus.off(BATTLE_EVENT.HAND_UPDATED, this.renderProtocols, this);
    }

    renderProtocols() {
        // 1. Очищаем панель перед рендером
        this.node.removeAllChildren();

        const hand = this._store.hand.value;
        console.log(`📡 ActionPanel: Отрисовка ${hand.length} протоколов`);

        // 2. Создаем префабы на основе данных из Стора
        hand.forEach((data) => {
            const protocolNode = instantiate(this.protocolPrefab);
            protocolNode.parent = this.node; // Layout сам их расставит

            const itemScript = protocolNode.getComponent(ProtocolItem);
            if (itemScript) {
                itemScript.init(data);
            }
        });
    }
}