import { _decorator, Component, Label, Sprite, SpriteAtlas } from 'cc';
import { useProfileStore } from './profile.store';
import { useLoadoutStore } from '../../loadout/model/loadout.store';

const { ccclass, property } = _decorator;

@ccclass
export default class ProfileAvatar extends Component {
    @property(Label) nickLabel: Label = null;
    @property(Sprite) avatarSprite: Sprite = null;
    @property(SpriteAtlas) vanguardsAtlas: SpriteAtlas = null;

    private profileStore = null;
    private loadoutStore = null;

    onEnable() {
        this.profileStore = useProfileStore();
        this.loadoutStore = useLoadoutStore();

        this.profileStore.user.events.on('changed', this.refreshUI, this);
        this.loadoutStore.loadout.events.on('changed', this.refreshUI, this);

        this.refreshUI();
    }

    onDisable() {
        if (this.profileStore?.user) {
            this.profileStore.user.events.off('changed', this.refreshUI, this);
        }
        if (this.loadoutStore?.loadout) {
            this.loadoutStore.loadout.events.off('changed', this.refreshUI, this);
        }
    }

    refreshUI() {
        const user = this.profileStore?.user.value;
        const loadout = this.loadoutStore?.loadout.value;

        if (user && this.nickLabel) {
            this.nickLabel.string = user.nickname;
        }

        if (loadout?.vanguardName && this.avatarSprite) {
            const key = loadout.vanguardName;
            const frame = this.vanguardsAtlas.getSpriteFrame(`${key.toLowerCase()}_icon`);
            if (frame) {
                this.avatarSprite.spriteFrame = frame;
            }
        }
    }
}