import { _decorator, Button, Component, director } from 'cc';
import { useBattleStore } from '../store/BattleStore';
const { ccclass, property } = _decorator;

@ccclass('StartBattleButton')
export class StartBattleButton extends Component {

    async onStartClick() {
        const battleStore = useBattleStore();

        // 1. Выключаем кнопку, чтобы игрок не нажал её дважды во время загрузки 🚫
        const btn = this.getComponent(Button);
        if (btn) btn.interactable = false;

        console.log("📡 Кнопка: Запрашиваем начало боя...");

        // 2. Вызываем наш Action из Стора и ждем результат
        const success = await battleStore.fetchBattleState();

        if (success) {
            console.log("✅ Данные в Сторе, загружаем сцену боя!");
            
            // 3. Переходим на сцену боя 🚀
            // Убедись, что сцена в настройках проекта называется именно "BATTLE"
            director.loadScene("Battleground");
        } else {
            console.error("❌ Ошибка загрузки данных боя");
            
            // Если произошла ошибка, возвращаем кнопке активность
            if (btn) btn.interactable = true;
        }
    }
}