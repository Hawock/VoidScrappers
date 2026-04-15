import { _decorator, Component, Sprite, SpriteAtlas } from 'cc';
import { useProfileStore } from './profile.store';

const { ccclass, property } = _decorator;

@ccclass('MainVanguard')
export class MainVanguard extends Component {
    @property(Sprite) bodySprite: Sprite = null!;
    @property(SpriteAtlas) vanguardsAtlas: SpriteAtlas = null!;

    private _profileStore = useProfileStore();

    onEnable() {
        // 1. Подписываемся на изменения в рефе 'user'
        // Твой класс Ref имеет публичное поле events (EventTarget)
        this._profileStore.user.events.on('changed', this.updateAppearance, this);

        // 2. Сразу вызываем обновление, чтобы отрисовать текущее состояние
        this.updateAppearance();
    }

    onDisable() {
        // ОБЯЗАТЕЛЬНО отписываемся, чтобы не было утечек памяти
        this._profileStore.user.events.off('changed', this.updateAppearance, this);
    }

    private updateAppearance() {
        const user = this._profileStore.user.value;
        
        // Проверяем, есть ли вообще юзер и выбранный авангард
        if (!user || !user.activeVanguard) {
            console.log("Авангард не выбран или данных нет");
            // Тут можно поставить какой-то дефолтный спрайт или скрыть
            return;
        }

        // Берем код активного авангарда (например, 'STRIKER' или 'WARRIOR')
        const code = user.activeVanguard.vanguard.name;

        // Достаем спрайт из атласа по коду
        const frame = this.vanguardsAtlas.getSpriteFrame(code.toLowerCase());

        if (frame) {
            this.bodySprite.spriteFrame = frame;
            console.log(`Визуал авангарда обновлен на: ${code}`);
        } else {
            console.warn(`Спрайт для кода ${code} не найден в атласе!`);
        }
    }
}