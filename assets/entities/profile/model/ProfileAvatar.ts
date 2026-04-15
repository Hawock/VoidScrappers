import { _decorator, Component, Label, Node, Sprite, SpriteAtlas } from 'cc';
import { useProfileStore } from './profile.store';
const { ccclass, property } = _decorator;

@ccclass
export default class ProfileAvatar extends Component {
    @property(Label) nickLabel: Label = null;
    @property(Sprite) avatarSprite: Sprite = null;
    @property(SpriteAtlas) vanguardsAtlas: SpriteAtlas = null;

    private store = null;

    onEnable() {
        this.store = useProfileStore();

        // 1. Подписываемся на твой кастомный EventTarget внутри Ref
        this.store.user.events.on('changed', this.refreshUI, this);

        // 2. Первичная отрисовка, если данные уже есть
        if (this.store.user.value) {
            this.refreshUI(this.store.user.value);
        }
    }

    onDisable() {
        // 3. Отписываемся, используя твою систему событий
        if (this.store && this.store.user) {
            this.store.user.events.off('changed', this.refreshUI, this);
        }
    }

    refreshUI(userData: any) {
        const user = userData || this.store.user.value;
        
        if (!user || !user.activeVanguard) return;

        // Обновляем текст
        this.nickLabel.string = user.nickname;

        // Ищем спрайт в атласе
        const key = user.activeVanguard.vanguard.name;
        const frame = this.vanguardsAtlas.getSpriteFrame(`${key.toLowerCase()}_icon`);
        
        if (frame) {
            this.avatarSprite.spriteFrame = frame;
        }
    }
}