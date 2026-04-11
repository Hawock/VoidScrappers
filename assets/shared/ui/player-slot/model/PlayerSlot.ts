import { _decorator, Component, Node, Label, Sprite, SpriteFrame } from 'cc';
import { useLobbyStore } from '../../../store/lobby/model/lobby.store';

const { ccclass, property } = _decorator;

@ccclass('PlayerSlot')
export class PartySlot extends Component {
    @property(Node) emptyState: Node = null!;
    @property(Node) playerState: Node = null!;
    @property(Label) nicknameLabel: Label = null!;
    @property(Sprite) robotIcon: Sprite = null!;
    @property(Node) readyIndicator: Node = null!;
    @property(Node) leaderIcon: Node = null!;

    @property([SpriteFrame]) robotSprites: SpriteFrame[] = []; // Сюда закинь 4 робота в инспекторе

    private slotIndex: number = 0;

    public init(index: number) {
        this.slotIndex = index;
        this.updateUI();
    }

    public updateUI() {
        const lobby = useLobbyStore();
        const party = lobby.players; // Массив участников из стора
        const playerData = party[this.slotIndex];

        if (playerData) {
            this.showPlayer(playerData);
        } else {
            this.showEmpty();
        }
    }

    private showPlayer(data: any) {
        this.emptyState.active = false;
        this.playerState.active = true;

        this.nicknameLabel.string = data.nickname;
        this.readyIndicator.active = data.isReady;
        
        // Лидер — это первый игрок в массиве группы (party[0])
        this.leaderIcon.active = (this.slotIndex === 0);

        // Для теста: выбираем робота по индексу или по какому-то ID из данных
        // Если у игрока в профиле есть robotId, используй его
        const spriteIdx = data.robotId || this.slotIndex; 
        if (this.robotSprites[spriteIdx]) {
            this.robotIcon.spriteFrame = this.robotSprites[spriteIdx];
        }
    }

    private showEmpty() {
        this.emptyState.active = true;
        this.playerState.active = false;
        this.leaderIcon.active = false;
    }

    // Привяжи этот метод к кнопке InviteButton в инспекторе
    public onInviteClick() {
        console.log("📢 Открываем список друзей для слота:", this.slotIndex);
        // Здесь мы будем вызывать диалог списка друзей
    }
}