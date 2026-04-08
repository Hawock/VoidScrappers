import { _decorator, Component, Prefab, instantiate, Node } from 'cc';
import { BATTLE_EVENT, battleBus } from '../../shared/event-bus/BatleBus';
import { ShipIcon } from './ShipIcon';
import { Player } from '../../core';

const { ccclass, property } = _decorator;

@ccclass('ReadyPlayersIndicators')
export class ReadyPlayersIndicators extends Component {
    @property(Prefab) public shipIconPrefab: Prefab = null!;

    onEnable() {
        // Подписываемся
        battleBus.on(BATTLE_EVENT.SYNC_READY_PLAYERS, this.updateList, this);
    }

    onDisable() {
        // Всегда чистим за собой, чтобы не ловить "зомби-события"
        battleBus.off(BATTLE_EVENT.SYNC_READY_PLAYERS, this.updateList, this);
    }

    updateList(readyPlayers: Player[]) {
        this.node.removeAllChildren();

        readyPlayers.forEach(player => {
            const iconNode = instantiate(this.shipIconPrefab);
            const script = iconNode.getComponent(ShipIcon)!;
            
            script.init(player);
            iconNode.parent = this.node;
        });
    }
}