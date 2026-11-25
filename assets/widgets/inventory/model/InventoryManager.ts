import { _decorator, Component, EventTouch, Input, input, Node, Prefab, instantiate, UITransform, Vec2, Vec3, ScrollView, SpriteFrame, Label } from 'cc';
import { watch } from 'db://assets/shared/infra/reactivity';
import { InventorySlot } from './InventorySlot';
import { useInventoryStore } from 'db://assets/entities/module/model/inventory.store';
import { useProfileStore } from 'db://assets/entities/profile/model/profile.store';
import { ModuleItem } from 'db://assets/entities/module/model/ModuleItem';
import { VanguardSlot } from 'db://assets/entities/vanguard-slot/model/VanguardSlot';
import { UserModule } from 'db://assets/entities/module/model/classess/module';
import { ModuleDragItem } from 'db://assets/entities/module/model/ModuleDragItem';
import { RARITY } from 'db://assets/entities/module/config/module.enum';

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
    @property(ScrollView) inventoryScroll: ScrollView = null!;

    // Наш новый компонент для призрака
    @property(ModuleDragItem) dragVisualComp: ModuleDragItem = null!;

    private _inventoryStore = useInventoryStore();
    private _profileStore = useProfileStore();
    private _slots: InventorySlot[] = [];
    private _draggedData: UserModule | null = null;
    private _watchers: Function[] = [];

    onLoad() {
        // Гарантируем, что призрак выключен
        if (this.dragVisualComp) this.dragVisualComp.node.active = false;

        this.generateEmptyGrid(24);

        this._watchers.push(watch(this._inventoryStore.fullInventoryList, (items) => {
            console.log(`[MANAGER] Список обновился, объектов: ${items.length}`);
            this.syncInventoryUI(items);
        }));

        this._watchers.push(watch(this._inventoryStore.userModules, () => {
            const currentUser = this._profileStore.user.value;
            if (currentUser?.activeVanguard) {
                console.log("[MANAGER] Модули изменились, обновляю слоты авангарда...");
                // Вызываем нашу функцию из стора, которая вернет актуальный список надетых вещей
                const equipped = this._inventoryStore.equippedModules(currentUser.activeVanguard.id).value;
                this.syncVanguardUI(equipped || []);
            }
        }));

        this._watchers.push(watch(this._inventoryStore.selectedModule, () => {
            console.log("[MANAGER] Смена модуля в сторе, обновляю визуал...");
            this.updateVisualSelection();
        }));

        // 2. Умная подписка на модули экипировки
        this._watchers.push(watch(this._profileStore.user, (user) => {
            const activeVanguard = user?.activeVanguard;
            if (activeVanguard) {
                console.log(`[MANAGER] Робот опознан: ${activeVanguard.vanguard?.name}`);
                const equipped = this._inventoryStore.equippedModules(activeVanguard.id).value;
                this.syncVanguardUI(equipped || []);
            }
        }));

        // Глобальные события тача для Drag & Drop
        input.on(Input.EventType.TOUCH_MOVE, this.onGlobalMove, this);
        input.on(Input.EventType.TOUCH_END, this.onGlobalEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this.onGlobalEnd, this);
    }

    public async onCloseClick() {
        if (this._inventoryStore.isLoading.value) return;

        const ok = await this._inventoryStore.commitInventory();
        if (!ok) {
            // Если сеть или сервер вернули ошибку — оставляем экран открытым, чтобы правки не пропали
            return;
        }

        this._inventoryStore.selectModule(null);
        this.node.active = false;
    }

    private updateVisualSelection() {
        const mod = this._inventoryStore.selectedModule.value;
        const selectedId = mod ? (mod.id || mod.moduleId) : null;

        // Собираем все компоненты ModuleItem, которые сейчас есть на сцене
        // (и в инвентаре, и в слотах авангарда)
        const allItems = this.node.getComponentsInChildren(ModuleItem);

        allItems.forEach(itemComp => {
            if (itemComp.data) {
                const isSelected = (itemComp.data.id || itemComp.data.moduleId) === selectedId;
                itemComp.setSelect(isSelected);
            }
        });
    }


    onEnable() {
        // Сначала убедимся, что сетка создана (если вдруг onLoad еще не отработал)
        if (this._slots.length === 0) this.generateEmptyGrid(24);

        const allItems = this._inventoryStore.fullInventoryList.value;
        if (allItems && allItems.length > 0) {
            this.syncInventoryUI(allItems);
        }

        const currentUser = this._profileStore.user.value;
        if (currentUser?.activeVanguard) {
            const equipped = this._inventoryStore.equippedModules(currentUser.activeVanguard.id).value;
            this.syncVanguardUI(equipped || []);
        }
    }

    onDestroy() {
        // Очистка подписок при уничтожении менеджера
        this._watchers.forEach(unwatch => unwatch());
        this._watchers = [];

        input.off(Input.EventType.TOUCH_MOVE, this.onGlobalMove, this);
        input.off(Input.EventType.TOUCH_END, this.onGlobalEnd, this);
        input.off(Input.EventType.TOUCH_CANCEL, this.onGlobalEnd, this);
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

    private syncInventoryUI(items: UserModule[]) {
        this._slots.forEach(slot => slot.clear());
        if (!items) return;

        items.forEach((data, index) => {
            if (this._slots[index]) {
                const moduleNode = instantiate(this.modulePrefab);
                const itemComp = moduleNode.getComponent(ModuleItem);
                if (itemComp) {
                    itemComp.init(data);
                    this._slots[index].addModule(moduleNode);
                }
            }
        });
        this.updateVisualSelection();
    }

    private syncVanguardUI(equippedModules: UserModule[]) {
        const uiSlots = this.vanguardSlotsNode.getComponentsInChildren(VanguardSlot);
        const user = this._profileStore.user.value;
        const slotsDefinition = user?.activeVanguard?.vanguard?.vanguardSlots || [];

        uiSlots.forEach(slot => slot.clear());

        slotsDefinition.forEach(slotDef => {
            const targetUI = uiSlots.find(s => Number(s.displayOrder) === Number(slotDef.displayOrder));
            if (targetUI) {
                targetUI.initSlot(slotDef.slot?.code || "WEAPON", slotDef.id);
                const modData = equippedModules?.find(m => m.vanguardSlotId === slotDef.id);

                if (modData) {
                    const moduleNode = instantiate(this.modulePrefab);
                    const itemComp = moduleNode.getComponent(ModuleItem);
                    if (itemComp) {
                        itemComp.init(modData);
                        targetUI.addModule(moduleNode);
                    }
                }
            }
        });
        this.updateVisualSelection();
    }

    // --- DRAG & DROP ---

    public startDrag(data: UserModule, worldPos: Vec3, currentIcon: SpriteFrame | null) {
        this._draggedData = data;

        // 1. Выбираем модуль в сторе
        const id = data.id || data.moduleId;
        if (this._inventoryStore.selectedModuleId.value !== id) {
            console.log("Выбираем модуль", id);
            this._inventoryStore.selectModule(id);
        }

        // 2. СРАЗУ заставляем оригинал в сетке или на роботе пульсировать
        this.updateVisualSelection();

        this.updateSlotsHighlight(true);

        if (this.dragVisualComp) {
            this.dragVisualComp.node.active = true;
            this.dragVisualComp.node.setWorldPosition(worldPos);
            this.dragVisualComp.init(data);
            this.dragVisualComp.setIcon(currentIcon);

            // ПРИЗРАК НЕ ПУЛЬСИРУЕТ - оставляем его как есть
            // this.dragVisualComp.setSelect(false); 
        }

        if (this.inventoryScroll) this.inventoryScroll.enabled = false;
    }

    private updateSlotsHighlight(isDragging: boolean) {
        const slots = this.vanguardSlotsNode.getComponentsInChildren(VanguardSlot);
        const draggedType = this._draggedData?.slotType;

        slots.forEach(slot => {
            // Слот подходит, если его тип совпадает с типом перетаскиваемого модуля
            const isSuitable = slot.slotType.toUpperCase() === draggedType.toUpperCase();
            slot.setHighlightState(isSuitable, isDragging);
        });
    }

    public updateDrag(screenPos: Vec2) {
        if (!this.dragVisualComp || !this._draggedData) return;

        if (!this.dragVisualComp.node.active) {
            this.dragVisualComp.node.active = true;
        }

        // Конвертация координат (самый надежный способ для UI)
        const parentUITrans = this.node.getComponent(UITransform)!;
        const localPos = parentUITrans.convertToNodeSpaceAR(new Vec3(screenPos.x, screenPos.y, 0));

        // console.log("Ghost Moving To:", localPos.x, localPos.y);
        this.dragVisualComp.node.setPosition(localPos);
    }

    private onGlobalMove(event: EventTouch) {
        // ЛОГ ДО ПРОВЕРКИ
        console.log("Global Move Fired");

        if (!this.dragVisualComp) return;

        // Если этот лог не пишется, значит node.active почему-то false
        if (!this.dragVisualComp.node.active) {
            // console.log("Move ignored: Ghost node is inactive");
            return;
        }

        const screenPos = event.getUILocation();
        const parentUITrans = this.node.getComponent(UITransform)!;
        const localPos = parentUITrans.convertToNodeSpaceAR(new Vec3(screenPos.x, screenPos.y, 0));

        console.log("Ghost Pos:", localPos.x, localPos.y);
        this.dragVisualComp.node.setPosition(localPos);
    }

    public onGlobalEnd(event: EventTouch) {
        if (!this.dragVisualComp || !this.dragVisualComp.node.active || !this._draggedData) return;

        const touchPos = event.getUILocation();
        const isDroppedInInv = this.isPosInNode(touchPos, this.inventoryArea);

        if (isDroppedInInv) {
            // Если тянули надетый модуль в инвентарь — снимаем
            if (this._draggedData.id && this._draggedData.equippedToId) {
                this._inventoryStore.unequipModule(this._draggedData.id);
            }
        } else {
            // Пытаемся поставить на робота
            this.handleVanguardDrop(touchPos);
        }
        this.updateSlotsHighlight(false);

        this.dragVisualComp.node.active = false;
        if (this.inventoryScroll) this.inventoryScroll.enabled = true;
        this._draggedData = null;
    }

    private handleVanguardDrop(touchPos: Vec2) {
        const slots = this.vanguardSlotsNode.getComponentsInChildren(VanguardSlot);
        const activeVanguard = this._profileStore.user.value?.activeVanguard;

        if (!activeVanguard || !this._draggedData) return;

        for (const slot of slots) {
            if (this.isPosInNode(touchPos, slot.node)) {

                // 1. ПРОВЕРКА ТИПА (Weapon, Core и т.д.)
                if (slot.slotType.toUpperCase() !== this._draggedData.slotType.toUpperCase()) {
                    console.warn(`[D&D] Тип не совпадает! Слот: ${slot.slotType}, Модуль: ${this._draggedData.slotType}`);
                    return;
                }

                // 2. ПРОВЕРКА ЛИМИТА СТАРТЕРОВ
                if (this._draggedData.rarity.toLowerCase() === RARITY.STARTER.toUpperCase() && !this._draggedData.equippedToId) {
                    const canAdd = this._inventoryStore.canAddStarter.value[slot.slotType.toUpperCase()];
                    if (!canAdd) {
                        console.error(`[D&D] Лимит стартеров для ${slot.slotType} исчерпан!`);
                        return;
                    }
                }

                // 3. ОТПРАВКА В СТОР
                // Если id нет (это чертеж), берем moduleId
                const idToEquip = this._draggedData.id || this._draggedData.moduleId;

                console.log(`[D&D] Экипируем ${idToEquip} в слот ${slot.slotId}`);
                this._inventoryStore.equipModule(idToEquip, activeVanguard.id, slot.slotId);
                return;
            }
        }
    }

    private isPosInNode(worldPos: Vec2, node: Node): boolean {
        if (!node || !node.isValid) return false;
        const uiTrans = node.getComponent(UITransform);
        if (!uiTrans) return false;

        // Получаем ограничивающую рамку ноды в мировых координатах
        const rect = uiTrans.getBoundingBoxToWorld();

        // Проверяем, входит ли точка тача (worldPos) в этот прямоугольник
        return rect.contains(worldPos);
    }
}