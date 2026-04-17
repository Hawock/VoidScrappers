import { _decorator, Component, EventTouch, Input, input, Node, Prefab, instantiate, UITransform, Vec2, Vec3, ScrollView, UIOpacity } from 'cc';
import { watch } from 'db://assets/shared/infra/reactivity';
import { InventorySlot } from './InventorySlot';
import { useInventoryStore } from 'db://assets/entities/module/model/inventory.store';
import { useProfileStore } from 'db://assets/entities/profile/model/profile.store'; // Проверь путь!
import { IUserModule } from 'db://assets/entities/module/types/IUserModule';
import { ModuleItem } from 'db://assets/entities/module/model/ModuleItem';
import { VanguardSlot } from 'db://assets/entities/vanguard-slot/model/VanguardSlot';

const { ccclass, property } = _decorator;

@ccclass('InventoryManager')
export class InventoryManager extends Component {
    // --- ПРЕФАБЫ ---
    @property(Prefab) slotPrefab: Prefab = null!;
    @property(Prefab) modulePrefab: Prefab = null!;

    // --- НОДЫ ---
    @property(Node) contentNode: Node = null!;      // Сетка инвентаря
    @property(Node) vanguardSlotsNode: Node = null!; // Нода, где лежат слоты на роботе
    @property(Node) inventoryArea: Node = null!;    // Область рюкзака
    @property(Node) dragVisual: Node = null!;       // "Призрак" при перетаскивании
    @property(ScrollView) inventoryScroll: ScrollView = null!;

    private _inventoryStore = useInventoryStore();
    private _profileStore = useProfileStore();
    private _slots: InventorySlot[] = [];
    private _draggedData: any = null;

    onLoad() {
        this.dragVisual.active = false;
        this.generateEmptyGrid(24);

        // 1. Следим за рюкзаком (чертежами)
        watch(this._inventoryStore.stashBlueprints, (bp) => this.syncInventoryUI(bp));

        // 2. Умная подписка на модули
        // Следим за изменениями всего юзера. Как только он прилетит или сменится — сработает логика.
        watch(this._profileStore.user, (user) => {
            const activeVanguard = user?.activeVanguard;

            if (activeVanguard) {
                console.log(`[MANAGER] Робот опознан: ${activeVanguard.vanguard?.name}`);

                // Берем модули из стора, используя ID экземпляра (UserVanguard.id)
                const equipped = this._inventoryStore.equippedModules(activeVanguard.v.id).value;
                this.syncVanguardUI(equipped || []);
            }
        });

        // 3. Мгновенная отрисовка, если данные уже есть в памяти (при открытии окна)
        const currentUser = this._profileStore.user.value;
        if (currentUser?.activeVanguard) {
            const equipped = this._inventoryStore.equippedModules(currentUser.activeVanguard.id).value;
            this.syncVanguardUI(equipped || []);
        }

        // Глобальные события
        input.on(Input.EventType.TOUCH_MOVE, this.onGlobalMove, this);
        input.on(Input.EventType.TOUCH_END, this.onGlobalEnd, this);
    }

    onEnable() {
        // Вызываем отрисовку каждый раз, когда окно становится активным
        console.log("MANAGER: Окно открыто, проверяю данные в сторе...");
        
        const blueprints = this._inventoryStore.stashBlueprints.value;
        if (blueprints && blueprints.length > 0) {
            this.syncInventoryUI(blueprints);
        }

        const currentUser = this._profileStore.user.value;
        if (currentUser?.activeVanguard) {
            const equipped = this._inventoryStore.equippedModules(currentUser.activeVanguard.id).value;
            this.syncVanguardUI(equipped || []);
        }
    }

    private generateEmptyGrid(count: number) {
        this.contentNode.removeAllChildren();
        this._slots = [];
        for (let i = 0; i < count; i++) {
            const slotNode = instantiate(this.slotPrefab);
            slotNode.parent = this.contentNode;
            const slotComp = slotNode.getComponent(InventorySlot);
            if (slotComp) this._slots.push(slotComp);
        }
    }

    /**
     * Заполнение сетки рюкзака чертежами
     */
    private syncInventoryUI(blueprints: any[]) {
        console.log("--- СТАРТ СИНХРОНИЗАЦИИ ЧЕРТЕЖЕЙ---");
        console.log("Кол-во чертежей в массиве:", blueprints.length);
        this._slots.forEach(slot => slot.clear());
        if (!blueprints) return;

        blueprints.forEach((data, index) => {
            if (this._slots[index]) {
                const moduleNode = instantiate(this.modulePrefab);
                moduleNode.getComponent(ModuleItem).init(data);
                this._slots[index].addModule(moduleNode);
            }
        });
    }

    /**
     * Заполнение слотов на самом роботе
     */
    private syncVanguardUI(equippedModules: any[]) {
        const uiSlots = this.vanguardSlotsNode.getComponentsInChildren(VanguardSlot);
        const user = this._profileStore.user.value;
        const slotsDefinition = user?.activeVanguard?.vanguard?.vanguardSlots || [];

        console.log("--- СТАРТ СИНХРОНИЗАЦИИ ---");
        console.log("Кол-во одетых модулей в массиве:", equippedModules.length);
        if (equippedModules.length > 0) {
            console.log("ID слотов в модулях:", equippedModules.map(m => m.vanguardSlotId));
        }

        uiSlots.forEach(slot => slot.clear());

        slotsDefinition.forEach(slotDef => {
            const targetUI = uiSlots.find(s => Number(s.displayOrder) === Number(slotDef.displayOrder));

            if (targetUI) {
                targetUI.initSlot(slotDef.slot?.code || "WEAPON", slotDef.id);

                // ЛОГ СРАВНЕНИЯ
                console.log(`Ищу модуль для слота ID: ${slotDef.id} (displayOrder: ${slotDef.displayOrder})`);

                const modData = equippedModules?.find(m => m.vanguardSlotId === slotDef.id);

                if (modData) {
                    console.log(`✅ МАТЧ НАЙДЕН! Ставлю ${modData.module?.name}`);
                    const moduleNode = instantiate(this.modulePrefab);
                    moduleNode.getComponent(ModuleItem).init(modData);
                    targetUI.addModule(moduleNode);
                } else {
                    console.warn(`❌ Модуль для ID ${slotDef.id} не найден в списке одетых.`);
                }
            }
        });
    }

    // --- DRAG & DROP ---

    public startDrag(data: any, worldPos: Vec3) {
        this._draggedData = data;
        this.dragVisual.active = true;
        this.dragVisual.setWorldPosition(worldPos);
        this.inventoryScroll.enabled = false;
    }

    private onGlobalMove(event: EventTouch) {
        if (!this.dragVisual.active) return;
        this.dragVisual.setWorldPosition(new Vec3(event.getUILocation().x, event.getUILocation().y, 0));
    }

    private onGlobalEnd(event: EventTouch) {
        if (!this.dragVisual.active || !this._draggedData) return;

        const touchPos = event.getUILocation();
        const isDroppedInInv = this.isPosInNode(touchPos, this.inventoryArea);

        if (isDroppedInInv) {
            // Если тянули с робота в инвентарь — снимаем
            if (this._draggedData.id && this._draggedData.equippedToId) {
                this._inventoryStore.unequipModule(this._draggedData.id);
            }
        } else {
            // Если бросили в сторону робота — пытаемся надеть
            this.handleVanguardDrop(touchPos);
        }

        this.dragVisual.active = false;
        this.inventoryScroll.enabled = true;
        this._draggedData = null;
    }

    private handleVanguardDrop(touchPos: Vec2) {
        const slots = this.vanguardSlotsNode.getComponentsInChildren(VanguardSlot);
        const currentVanguardId = this._profileStore.user.value?.activeVanguard.vanguard?.id;

        for (const slot of slots) {
            if (this.isPosInNode(touchPos, slot.node)) {
                // Вызываем экипировку из стора (проверка типа слота будет в сторе или тут)
                this._inventoryStore.equipModule(this._draggedData.id, currentVanguardId, slot.slotId);
                return;
            }
        }
    }

    private isPosInNode(worldPos: Vec2, node: Node): boolean {
        const uiTrans = node.getComponent(UITransform);
        if (!uiTrans) return false;
        const localPos = uiTrans.convertToNodeSpaceAR(new Vec3(worldPos.x, worldPos.y, 0));
        const size = uiTrans.contentSize;
        return Math.abs(localPos.x) <= size.width / 2 && Math.abs(localPos.y) <= size.height / 2;
    }
}