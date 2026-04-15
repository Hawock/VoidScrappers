import { _decorator, Component, Prefab, instantiate, Node } from 'cc';
import { useLobbyStore } from 'db://assets/shared/store/lobby/model/lobby.store';
import { ILobbyPlayer } from 'db://assets/shared/store/lobby/types/LobbyPlayer';
import { PlayerSlot } from 'db://assets/shared/ui/player-slot/model/PlayerSlot';


const { ccclass, property } = _decorator;

@ccclass('PlayerManager')
export class PlayerManager extends Component {
    @property(Prefab) slotPrefab: Prefab = null!;
    @property({ step: 1 }) maxPlayers: number = 3;

    private _slots: PlayerSlot[] = [];
    private _lobbyStore: any = null;

    onLoad() {
        // Чистим контейнер и спавним слоты один раз
        this.node.removeAllChildren();
        this.spawnSlots();
    }

    onEnable() {
        this._lobbyStore = useLobbyStore();
        // Подписываемся на твой Ref
        this._lobbyStore.players.events.on('changed', this.syncUI, this);
        this.syncUI();
    }

    private spawnSlots() {
        for (let i = 0; i < this.maxPlayers; i++) {
            const slotNode = instantiate(this.slotPrefab);
            this.node.addChild(slotNode);
            
            const slotComp = slotNode.getComponent(PlayerSlot);
            if (slotComp) {
                this._slots.push(slotComp);
                slotComp.setData(null); // Изначально пустой (плюсик)
            }
        }
    }

   private syncUI() {
        const me = this._lobbyStore.getMyPlayer();
        if (!me) return;

        // 1. Фильтруем: 
        // - Берем тех, у кого такой же partyId
        // - ИСКЛЮЧАЕМ себя по id (p.id !== me.id)
        const othersInParty = Array.from(this._lobbyStore.players.value.values() as Iterable<ILobbyPlayer>)
            .filter(p => p.partyId === me.partyId && p.id !== me.id) 
            .sort((a, b) => (a.isLeader ? -1 : (b.isLeader ? 1 : 0)));

        // 2. Раздаем данные по слотам (теперь тут будут только друзья)
        this._slots.forEach((slot, index) => {
            const data = othersInParty[index] || null;
            slot.setData(data);
        });
    }

    onDisable() {
        this._lobbyStore?.players.events.off('changed', this.syncUI, this);
    }
}