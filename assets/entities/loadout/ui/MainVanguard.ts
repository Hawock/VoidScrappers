import { _decorator, Component, Sprite, SpriteAtlas } from 'cc';
import { useLoadoutStore } from '../model/loadout.store';

const { ccclass, property } = _decorator;

@ccclass('MainVanguard')
export class MainVanguard extends Component {
    @property(Sprite) bodySprite: Sprite = null!;
    @property(SpriteAtlas) vanguardsAtlas: SpriteAtlas = null!;

    private get _loadoutStore() {
        return useLoadoutStore();
    }

    onEnable() {
        this._loadoutStore.loadout.events.on('changed', this.updateAppearance, this);
        this.updateAppearance();
    }

    onDisable() {
        this._loadoutStore.loadout.events.off('changed', this.updateAppearance, this);
    }

    private updateAppearance() {
        const loadout = this._loadoutStore.loadout.value;

        if (!loadout || !loadout.vanguardName) {
            console.log("Авангард не выбран или данных нет");
            return;
        }

        const code = loadout.vanguardName;
        const frame = this.vanguardsAtlas.getSpriteFrame(code.toLowerCase());

        if (frame) {
            this.bodySprite.spriteFrame = frame;
            console.log(`Визуал авангарда обновлен на: ${code}`);
        } else {
            console.warn(`Спрайт для кода ${code} не найден в атласе!`);
        }
    }
}