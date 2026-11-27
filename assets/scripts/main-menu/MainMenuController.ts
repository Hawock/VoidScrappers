import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
import { useDialogs } from '../../shared/ui/dialog';
import { useRaidLauncher } from '../../feature/raid-launcher/model/raid-launcher.feature';
import { ColyseusManager } from '../../app/ColyseusManager';
import { useProfileStore } from '../../entities/profile';
import { useInventoryStore } from '../../entities/inventory/model/inventory.store';
import { useLoadoutStore } from '../../entities/loadout/model/loadout.store';
import { useConfigStore } from '../../shared/app-config';

const { ccclass, property } = _decorator;

@ccclass('MainMenuController')
export class MainMenuController extends Component {
    @property(Prefab) raidListWidgetPrefab: Prefab = null!;
    @property(Prefab) inventoryPrefab: Prefab = null!;
    @property(Node) uiLayer: Node = null!;

    private _inventoryNode: Node | null = null;

    private get _inventoryStore() {
        return useInventoryStore();
    }

    private get _loadoutStore() {
        return useLoadoutStore();
    }

    private get _configStore() {
        return useConfigStore();
    }

    start() {
        const profileStore = useProfileStore();
        if (!profileStore.user.value) {
            console.warn("Профиль еще не загружен");
            return;
        }

        const user = profileStore.user.value;
        console.log("ПОЛНЫЙ ОБЪЕКТ ИГРОКА", user);
    }

    public async onOpenInventoryClick() {
        if (!this.inventoryPrefab || !this.uiLayer) {
            return;
        }
        await Promise.all([this._inventoryStore.getModules(), this._inventoryStore.getBluePrints()]);
        console.log("Данные загружены!");
        if (!this._inventoryNode) {
            this._inventoryNode = instantiate(this.inventoryPrefab);
            this._inventoryNode.parent = this.uiLayer;
        }

        this._inventoryNode.active = true;
    }

    private getEquippedProtocolsCount(): number {
        const equipped = this._loadoutStore.loadout.value?.equippedModules ?? [];
        return equipped.reduce(
            (sum, item) => sum + (item.selectedProtocols?.length ?? 0),
            0,
        );
    }

    public async onStartRaidButtonClick() {
        const required = this._configStore.requiredEquippedProtocols.value;
        const current = this.getEquippedProtocolsCount();

        if (current < required) {
            await useDialogs().showDialog({
                header: 'АВАНГАРД НЕ ГОТОВ',
                text: `Выбрано протоколов: ${current} из ${required}. Соберите полный комплект протоколов в разделе «Снаряжение» перед вылетом в рейд.`,
                confirmBtnText: 'ПОНЯТНО',
            });
            return;
        }

        useRaidLauncher().startRaidSelection(this.raidListWidgetPrefab);
    }

    public inviteFriend() {
        const friendId = "3fe738e7-0d9c-4269-805a-322a3e6acc42";
        if (ColyseusManager.instance) {
            ColyseusManager.instance.sendInvite(friendId);
        } else {
            console.error("❌ ColyseusManager не найден!");
        }
    }
}