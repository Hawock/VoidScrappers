import { _decorator, Component, Node, Button, Prefab } from 'cc';
import { useDialogs } from '../../shared/ui/dialog';
import { useRaidLauncher } from '../../feature/raid-launcher/model/raid-launcher.feature';
import { ColyseusManager } from '../../app/ColyseusManager';
import { useProfileStore } from '../../entities/profile';
// import { ExecutorRequest } from './твой/путь/ExecutorRequest'; // Пригодится чуть позже

const { ccclass, property } = _decorator;

@ccclass('MainMenuController')
export class MainMenuController extends Component {
    @property(Prefab) 
    raidListWidgetPrefab: Prefab = null!;

    start() {
        const { showDialog } = useDialogs()
        console.log(useProfileStore().user.value.id)
        const user = useProfileStore().user.value;
        console.log("ПОЛНЫЙ ОБЪЕКТ ИГРОКА", user);
        console.log(`Игрок: ${user.nickname}`);
        console.log(`Активный Авангард: ${user.activeVanguard?.vanguard?.name || 'НЕТ'}`);
        
        const modules = user.activeVanguard?.equippedModules || [];
        console.log(`Количество модулей: ${modules.length}`);

        modules.forEach((mod, index) => {
            const cards = mod.selectedProtocols || [];
            console.log(`[Slot ${index + 1}] Модуль: ${mod.module?.name} | Карт в колоде: ${cards.length}`);

            cards.forEach(card => {
                console.log(`   - Карта: ${card.protocol?.name} (Cost: ${card.protocol?.cost})`);
            });
        });

        console.log("======================");
        showDialog({
            header: "TECТОВОЕ",
            text: "Тестовое описание",
        })
    }

    public onStartRaidButtonClick() {
        // Просто делегируем всё управление фиче
        useRaidLauncher().startRaidSelection(this.raidListWidgetPrefab);
    }

    public inviteFriend(){
        console.log("📤 Шлем инвайт для:", "b00632b0-aa29-4727-b535-181a18ac5400");
        if (ColyseusManager.instance) {
            ColyseusManager.instance.sendInvite("b00632b0-aa29-4727-b535-181a18ac5400");
        } else {
            console.error("❌ ColyseusManager не найден в бессмертных нодах!");
        }
    }

   
}