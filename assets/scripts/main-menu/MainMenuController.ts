import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
import { useDialogs } from '../../shared/ui/dialog';
import { useRaidLauncher } from '../../feature/raid-launcher/model/raid-launcher.feature';
import { ColyseusManager } from '../../app/ColyseusManager';
import { useProfileStore } from '../../entities/profile';
import { useInventoryStore } from '../../entities/module/model/inventory.store';

const { ccclass, property } = _decorator;

@ccclass('MainMenuController')
export class MainMenuController extends Component {
    @property(Prefab) raidListWidgetPrefab: Prefab = null!;
    @property(Prefab) inventoryPrefab: Prefab = null!; 
    @property(Node) uiLayer: Node = null!;            

    private _inventoryNode: Node | null = null;

    // ГЕТТЕР вместо прямого присвоения — это спасет от ошибок в редакторе
    private get _inventoryStore() {
        return useInventoryStore();
    }

    start() {
        // Проверяем, загружен ли профиль, прежде чем логировать
        const profileStore = useProfileStore();
        if (!profileStore.user.value) {
            console.warn("Профиль еще не загружен");
            return;
        }

        const user = profileStore.user.value;
        console.log("ПОЛНЫЙ ОБЪЕКТ ИГРОКА", user);
        
        // ... твой остальной код логов ...
    }

    public async onOpenInventoryClick() {
        if (!this.inventoryPrefab || !this.uiLayer) {
            return;
        }
        // Стор подхватится через геттер при вызове
        await Promise.all([this._inventoryStore.getModules(), this._inventoryStore.getBluePrints()]);
        console.log("Данные загружены!");
        if (!this._inventoryNode) {
            this._inventoryNode = instantiate(this.inventoryPrefab);
            this._inventoryNode.parent = this.uiLayer;
        }

        this._inventoryNode.active = true;
    }

    public onStartRaidButtonClick() {
        useRaidLauncher().startRaidSelection(this.raidListWidgetPrefab);
    }

    public inviteFriend(){
        const friendId = "3fe738e7-0d9c-4269-805a-322a3e6acc42";
        if (ColyseusManager.instance) {
            ColyseusManager.instance.sendInvite(friendId);
        } else {
            console.error("❌ ColyseusManager не найден!");
        }
    }
}