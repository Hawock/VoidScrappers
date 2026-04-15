import { _decorator, Component, Node, Label, Sprite, SpriteFrame, SpriteAtlas } from 'cc';
import { ILobbyPlayer } from '../../../store/lobby/types/LobbyPlayer';
import { useLobbyStore } from '../../../store/lobby/model/lobby.store';
import { ColyseusManager } from 'db://assets/app/ColyseusManager';

const { ccclass, property } = _decorator;

@ccclass('PlayerSlot')
export class PlayerSlot extends Component {
    @property(Node) emptyState: Node = null!;
    @property(Node) playerState: Node = null!;
    @property(Label) nicknameLabel: Label = null!;
    @property(Sprite) robotIcon: Sprite = null!;
    @property(Node) readyIndicator: Node = null!;
    @property(Node) leaderIcon: Node = null!;
    @property(SpriteAtlas) vanguardsAtlas: SpriteAtlas = null!;

    /**
     * Единственный вход данных
     */
    public setData(data: ILobbyPlayer | null) {
        if (!data) {
            this.showEmpty();
            return;
        }
        this.showPlayer(data);
    }

    private showPlayer(data: ILobbyPlayer) {
        console.log("ИГРОК:", data)
        this.emptyState.active = false;
        this.playerState.active = true;

        this.nicknameLabel.string = data.nickname;
        this.readyIndicator.active = data.isReady;
        this.leaderIcon.active = data.isLeader;
        
        const frame = this.vanguardsAtlas.getSpriteFrame(`${data.vanguardKey?.toLowerCase()}_icon`);
        if (frame) this.robotIcon.spriteFrame = frame;
    }

    private showEmpty() {
        this.emptyState.active = true;
        this.playerState.active = false;
    }

    public onInviteClick() {
        const lobbyStore = useLobbyStore();
        const me = lobbyStore.getMyPlayer();
        console.log("👤 Мой профиль:", me);
        if (!me) return;

        // ХАРДКОД: возьми ID из консоли браузера/сервера второго игрока
        const targetIdForTest = "ID_ВТОРОГО_ИГРОКА"; 

        console.log(`📡 Отправляем силовой инвайт для ${targetIdForTest}...`);

        // Шлем запрос на сервер через наш ColyseusManager
        if (ColyseusManager.instance) {
            ColyseusManager.instance.sendInvite("b00632b0-aa29-4727-b535-181a18ac5400")
        }
    }
}
