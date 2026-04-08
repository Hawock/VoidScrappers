import { _decorator, Component, Node, Button, Prefab } from 'cc';
import { useDialogs } from '../../shared/ui/dialog';
import { useRaidLauncher } from '../../feature/raid-launcher/model/raid-launcher.feature';
// import { ExecutorRequest } from './твой/путь/ExecutorRequest'; // Пригодится чуть позже

const { ccclass, property } = _decorator;

@ccclass('MainMenuController')
export class MainMenuController extends Component {
    @property(Prefab) 
    raidListWidgetPrefab: Prefab = null!;

    start() {

    }

    public onStartRaidButtonClick() {
        // Просто делегируем всё управление фиче
        useRaidLauncher().startRaidSelection(this.raidListWidgetPrefab);
    }

   
}