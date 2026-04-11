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
        console.log("📤 Шлем инвайт для:", "5efc953f-f094-4427-bed2-e73bb995a955");
        if (ColyseusManager.instance) {
            ColyseusManager.instance.sendInvite("5efc953f-f094-4427-bed2-e73bb995a955");
        } else {
            console.error("❌ ColyseusManager не найден в бессмертных нодах!");
        }
    }

   
}