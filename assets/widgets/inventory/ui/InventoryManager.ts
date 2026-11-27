import { _decorator, Component, EventTouch, Input, input, Node, Prefab, instantiate, UITransform, Vec2, Vec3, ScrollView, SpriteFrame } from 'cc';
import { watch } from 'db://assets/shared/infra/reactivity';
import { useInventoryStore } from 'db://assets/entities/inventory/model/inventory.store';
import { ModuleItem } from 'db://assets/entities/module/model/ModuleItem';
import { VanguardSlot } from 'db://assets/entities/vanguard-slot/model/VanguardSlot';
import { UserModule } from 'db://assets/entities/module/model/classess/module';
import { ModuleDragItem } from 'db://assets/entities/module/model/ModuleDragItem';
import { RARITY } from 'db://assets/entities/module/config/module.enum';
import { useLoadoutStore } from 'db://assets/entities/loadout/model/loadout.store';
import { InventorySlot } from 'db://assets/entities/inventory/ui/InventorySlot';
import { useConfigStore } from 'db://assets/shared/app-config';
import { useDialogs } from 'db://assets/shared/ui';

const { ccclass, property } = _decorator;

@ccclass('InventoryManager')
export class InventoryManager extends Component {
    // --- ПРЕФАБЫ ---
    @property(Prefab) slotPrefab: Prefab = null!;
    @property(Prefab) modulePrefab: Prefab = null!;

    // --- НОДЫ ---
    @property(Node) contentNode: Node = null!;       // Сетка инвентаря
    @property(Node) vanguardSlotsNode: Node = null!; // Нода, где лежат слоты на роботе
    @property(Node) inventoryArea: Node = null!;     // Область рюкзака
    @property(ScrollView) inventoryScroll: ScrollView = null!;

    // Наш новый компонент для призрака
    @property(ModuleDragItem) dragVisualComp: ModuleDragItem = null!;

    private _inventoryStore = useInventoryStore();
    private _loadoutStore = useLoadoutStore();
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
            const loadout = this._loadoutStore.loadout.value;
            if (loadout) {
                console.log("[MANAGER] Модули изменились, обновляю слоты авангарда...");
                const equipped = this._inventoryStore.equippedModules(loadout.id).value;
                this.syncVanguardUI(equipped || []);
            }
        }));

        this._watchers.push(watch(this._inventoryStore.selectedModule, () => {
            console.log("[MANAGER] Смена модуля в сторе, обновляю визуал...");
            this.updateVisualSelection();
        }));

        this._watchers.push(watch(this._loadoutStore.loadout, (loadout) => {
            if (loadout) {
                console.log(`[MANAGER] Робот опознан: ${loadout.vanguardName}`);
                const equipped = this._inventoryStore.equippedModules(loadout.id).value;
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

        const required = useConfigStore().requiredEquippedProtocols.value;
        const current = this._inventoryStore.totalEquippedProtocolsCount.value;

        if (current < required) {
            const confirmed = await useDialogs().showDialog({
                header: 'НЕПОЛНЫЙ КОМПЛЕКТ ПРОТОКОЛОВ',
                text: `Выбрано протоколов: ${current} из ${required}. Выйти из снаряжения сейчас?`,
                isConfirm: true,
                confirmBtnText: 'ВЫЙТИ',
                rejectBtnText: 'ОСТАТЬСЯ',
            });

            if (!confirmed) {
                return;
            }
        }

        const ok = await this._inventoryStore.commitInventory();
        if (!ok) {
            return;
        }
        this._inventoryStore.selectModule(null);
        this.node.active = false;
    }

    private updateVisualSelection() {
        const mod = this._inventoryStore.selectedModule.value;
        const selectedId = mod ? (mod.id || mod.moduleId) : null;

        const allItems = this.node.getComponentsInChildren(ModuleItem);

        allItems.forEach(itemComp => {
            if (itemComp.data) {
                const isSelected = (itemComp.data.id || itemComp.data.moduleId) === selectedId;
                itemComp.setSelect(isSelected);
            }
        });
    }

    onEnable() {
        if (this._slots.length === 0) this.generateEmptyGrid(24);

        const allItems = this._inventoryStore.fullInventoryList.value;
        if (allItems && allItems.length > 0) {
            this.syncInventoryUI(allItems);
        }

        const loadout = this._loadoutStore.loadout.value;
        if (loadout) {
            const equipped = this._inventoryStore.equippedModules(loadout.id).value;
            this.syncVanguardUI(equipped || []);
        }
    }

    onDestroy() {
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
        const slotsDefinition = this._loadoutStore.loadout.value?.slots || [];

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

        const id = data.id || data.moduleId;
        if (this._inventoryStore.selectedModuleId.value !== id) {
            console.log("Выбираем модуль", id);
            this._inventoryStore.selectModule(id);
        }

        this.updateVisualSelection();
        this.updateSlotsHighlight(true);

        if (this.dragVisualComp) {
            this.dragVisualComp.node.active = true;
            this.dragVisualComp.node.setWorldPosition(worldPos);
            this.dragVisualComp.init(data);
            this.dragVisualComp.setIcon(currentIcon);
        }

        if (this.inventoryScroll) this.inventoryScroll.enabled = false;
    }

    private updateSlotsHighlight(isDragging: boolean) {
        const slots = this.vanguardSlotsNode.getComponentsInChildren(VanguardSlot);
        const draggedType = this._draggedData?.slotType;

        slots.forEach(slot => {
            const isSuitable = slot.slotType.toUpperCase() === draggedType.toUpperCase();
            slot.setHighlightState(isSuitable, isDragging);
        });
    }

    public updateDrag(screenPos: Vec2) {
        if (!this.dragVisualComp || !this._draggedData) return;

        if (!this.dragVisualComp.node.active) {
            this.dragVisualComp.node.active = true;
        }

        const parentUITrans = this.node.getComponent(UITransform)!;
        const localPos = parentUITrans.convertToNodeSpaceAR(new Vec3(screenPos.x, screenPos.y, 0));

        this.dragVisualComp.node.setPosition(localPos);
    }

    private onGlobalMove(event: EventTouch) {
        console.log("Global Move Fired");

        if (!this.dragVisualComp) return;
        if (!this.dragVisualComp.node.active) return;

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
            if (this._draggedData.id && this._draggedData.equippedToId) {
                this._inventoryStore.unequipModule(this._draggedData.id);
            }
        } else {
            this.handleVanguardDrop(touchPos);
        }
        this.updateSlotsHighlight(false);

        this.dragVisualComp.node.active = false;
        if (this.inventoryScroll) this.inventoryScroll.enabled = true;
        this._draggedData = null;
    }

    private handleVanguardDrop(touchPos: Vec2) {
        const slots = this.vanguardSlotsNode.getComponentsInChildren(VanguardSlot);
        const loadout = this._loadoutStore.loadout.value;

        if (!loadout || !this._draggedData) return;

        for (const slot of slots) {
            if (this.isPosInNode(touchPos, slot.node)) {
                if (slot.slotType.toUpperCase() !== this._draggedData.slotType.toUpperCase()) {
                    console.warn(`[D&D] Тип не совпадает! Слот: ${slot.slotType}, Модуль: ${this._draggedData.slotType}`);
                    return;
                }

                if (this._draggedData.rarity.toLowerCase() === RARITY.STARTER.toUpperCase() && !this._draggedData.equippedToId) {
                    const canAdd = this._inventoryStore.canAddStarter.value[slot.slotType.toUpperCase()];
                    if (!canAdd) {
                        console.error(`[D&D] Лимит стартеров для ${slot.slotType} исчерпан!`);
                        return;
                    }
                }

                const idToEquip = this._draggedData.id || this._draggedData.moduleId;

                console.log(`[D&D] Экипируем ${idToEquip} в слот ${slot.slotId}`);
                this._inventoryStore.equipModule(idToEquip, loadout.id, slot.slotId);
                return;
            }
        }
    }

    private isPosInNode(worldPos: Vec2, node: Node): boolean {
        if (!node || !node.isValid) return false;
        const uiTrans = node.getComponent(UITransform);
        if (!uiTrans) return false;

        const rect = uiTrans.getBoundingBoxToWorld();
        return rect.contains(worldPos);
    }
}