import { _decorator, Component, director, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ResourceLoader')
export class ResourceLoader extends Component {
    @property(Label)
    statusLabel: Label = null;

    // onLoad срабатывает ДО start, даже если узел активен
    onLoad() {
        console.log("🛠️ [Debug] ResourceLoader.onLoad: Компонент загружен в память");
    }

    // onEnable срабатывает, когда узел/компонент активируются
    onEnable() {
        console.log("🟢 [Debug] ResourceLoader.onEnable: Компонент активирован на сцене");
    }

    start() {
        console.log("🚀 [Debug] ResourceLoader.start: Жизненный цикл начался, ставим таймер");

        if (this.statusLabel) {
            this.statusLabel.string = "Загрузка модулей боевого интерфейса...";
        } else {
            console.warn("⚠️ [Debug] statusLabel не привязан в редакторе!");
        }

        // Самая вероятная точка сбоя, если Кокос не видит этот метод
        this.scheduleOnce(() => {
            console.log("🎉🎉🎉 [Debug] ТАЙМЕР ОЛЬБОТАЛ! Пытаемся сменить сцену...");
            console.log("[ResourceLoader] Ресурсы 'загружены', переходим в MainMenu");
            
            // Если и это не сработает, то проблема в настройках билда
            director.loadScene('MainMenu', (err) => {
                if (err) {
                    console.error("❌ Ошибка при загрузке MainMenu:", err);
                } else {
                    console.log("✅ Сцена MainMenu успешно загружена");
                }
            });

        }, 0.5); 
    }
}