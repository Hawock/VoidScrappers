import { _decorator, Component, Node, Sprite, SpriteAtlas, Label, tween, Vec3, isValid, log, UIOpacity, EventTouch, Vec2, Tween } from 'cc';
import { RARITY } from 'db://assets/entities/module/config/module.enum';
import { RemoteImageLoader } from 'db://assets/shared/infra/remote-image-loader';
import { UserModule } from './classess/module';
import { watch } from 'db://assets/shared/infra/reactivity';
import { useInventoryStore } from '../../inventory/model/inventory.store';
import { InventoryManager } from 'db://assets/widgets/inventory/ui/InventoryManager';


const { ccclass, property } = _decorator;

@ccclass('ModuleItem')
export class ModuleItem extends Component {
    // === АТЛАСЫ РЕДКОСТИ ===
    @property(SpriteAtlas) framesAtlas: SpriteAtlas = null!;

    // === ПРЕДМЕТЫ GUI ===
    @property({ type: Node }) spinnerNode: Node = null!;
    @property(Node) blueprintNode: Node = null!;
    // === КОМПОНЕНТЫ ОТОБРАЖЕНИЯ ===
    @property(Sprite) rarityBg: Sprite = null!;
    @property(Sprite) protocolFrameSprite: Sprite = null!;
    @property(Sprite) iconSprite: Sprite = null!;
    @property(Label) protocolLabel: Label = null!;
    @property(SpriteAtlas) typeAtlas: SpriteAtlas = null!;
    @property(Sprite) typeSprite: Sprite = null!;
    // === ДАННЫЕ И СОСТОЯНИЕ ===
    public data: UserModule;
    private _unwatch: Function | null = null;
    private _isSelected = false;
    private _isLoading = false;
    private _inventoryStore = useInventoryStore();
    private _canDrag = true;
    private _pulseTween: Tween<Node> | null = null;
    // === ПЕРЕМЕННЫЕ ДЛЯ INPUT ===
    private _touchTimer: any = null;
    private _isDragging = false;
    private _startTouchPos: Vec2 = new Vec2();

    // === МЕТОДЫ ИНИЦИАЛИЗАЦИИ ===

    public init(data: UserModule) {
        this.data = data;
        
        const rarityKey = (data.rarity || 'STARTER').toLowerCase();
        const frame = this.framesAtlas.getSpriteFrame(rarityKey);
        const frameType = this.typeAtlas.getSpriteFrame(`${data.slotType.toLowerCase()}-icon`);
        if (frame) {
            this.rarityBg.spriteFrame = frame;
            this.protocolFrameSprite.spriteFrame = frame;
        }
        if(frameType) this.typeSprite.spriteFrame = frameType;

        this.updateLabels();
    }

    onEnable() {
        this.updateVisualRemote();
        this.setupReactivity();

        // Подписываемся на события тача
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onDisable() {
        if (this._unwatch) {
            this._unwatch();
            this._unwatch = null;
        }
        
        // Отписываемся
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        
        this.cancelTouchTimer();
    }

    public setSelect(isSelected: boolean) {
        // 1. Сначала всегда останавливаем старую анимацию
        if (this._pulseTween) {
            this._pulseTween.stop();
            this._pulseTween = null;
        }

        if (isSelected) {
            // 2. Запускаем "дыхание"
            // Скейлим с 1.0 до 1.05 и обратно за 0.8 секунды
            this._pulseTween = tween(this.node)
                .to(0.8, { scale: new Vec3(1.05, 1.05, 1) }, { easing: 'sineInOut' })
                .to(0.8, { scale: new Vec3(1, 1, 1) }, { easing: 'sineInOut' })
                .union() // Объединяем в одну цепочку
                .repeatForever() // Зацикливаем
                .start();
        } else {
            // 3. Возвращаем в исходное состояние
            this.node.setScale(new Vec3(1, 1, 1));
        }
    }

    // === ОБРАБОТКА INPUT ===

    private onTouchStart(event: EventTouch) {
        this._isDragging = false;
        this._startTouchPos = event.getUILocation();

        if (!this._canDrag) return;

        this._touchTimer = setTimeout(() => {
            this.onLongClick();
        }, 500);
    }

    private cancelTouchTimer() {
        if (this._touchTimer) {
            clearTimeout(this._touchTimer);
            this._touchTimer = null;
        }
    }

    // --- ФИНАЛЬНЫЕ ДЕЙСТВИЯ ---

    private onClick() {
        if (!this.data) return;
        const id = this.data.id || this.data.moduleId;
        this._inventoryStore.selectModule(id);
    }

    private onLongClick() {
        log(`[UI] Лонг-клик: Информация о ${this.data.module.name}`);
        // Можно добавить легкую вибрацию или всплывающее инфо
    }

    private startDrag(event: EventTouch) {
        const manager = this.node.scene.getComponentInChildren(InventoryManager);
        if (manager) {
            manager.startDrag(
                this.data, 
                this.node.worldPosition, 
                this.iconSprite.spriteFrame // Просто отдаем то, что у нас уже есть
            );
        }
    }

    // === ОСТАЛЬНАЯ ЛОГИКА (БЕЗ ИЗМЕНЕНИЙ) ===

    private setupReactivity() {
        this._unwatch = watch(this._inventoryStore.canAddStarter, (limits) => {
            this.updateUI(limits);
        });
        this.updateUI(this._inventoryStore.canAddStarter.value);
    }

    private updateUI(limits: any) {
        if (!this.data) return;
        const isLimitReached = this.data.isBlueprint && !limits[this.data.slotType];
        let op = this.node.getComponent(UIOpacity) || this.node.addComponent(UIOpacity);
        op.opacity = isLimitReached ? 120 : 255;
        this._canDrag = !isLimitReached;
    }

    private updateLabels() {
        if (!this.data) return;
        
        if(!("unlockedProtocols" in this.data)) return;
        const pCount = this.data.unlockedProtocols?.length || 0;
        this.protocolFrameSprite.node.active = pCount > 0;
        this.protocolLabel.string = pCount.toString();
    }

    private async updateVisualRemote() {
        if (!this.data) return;
        const url = this.data.module.spriteFrame || "";
        if (!url) return;
        if(this.data.isBlueprint) this.blueprintNode.active = true;
        else this.blueprintNode.active = false;
        this.setLoadingState({ isLoading: true, isError: false });
        const spriteFrame = await RemoteImageLoader.loadSprite(url);

        if (!isValid(this) || !this.node.activeInHierarchy) return;

        if (spriteFrame) {
            this.iconSprite.spriteFrame = spriteFrame;
            this.setLoadingState({ isLoading: false, isError: false });
        } else {
            this.setLoadingState({ isLoading: false, isError: true });
        }
    }

    private setLoadingState(state: { isLoading: boolean, isError: boolean }) {
        this._isLoading = state.isLoading;
        this.spinnerNode.active = state.isLoading;
        this.iconSprite.node.active = !state.isLoading && !state.isError;
        const showVisuals = !state.isLoading && !state.isError;
        if (this.data) {
            this.protocolFrameSprite.node.active = showVisuals;
        }
    }

    private onTouchMove(event: EventTouch) {
        if (!this._canDrag) return;

        const currentPos = event.getUILocation();
        
        // Если мы уже в режиме драга — просто шлем координаты менеджеру
        if (this._isDragging) {
            const manager = this.node.scene.getComponentInChildren(InventoryManager);
            if (manager) {
                manager.updateDrag(currentPos); // Прямой вызов!
            }
            return;
        }

        // Логика определения начала драга (если еще не начали)
        const dist = Vec2.distance(this._startTouchPos, currentPos);
        if (dist > 10) {
            this.cancelTouchTimer();
            this._isDragging = true;
            this.startDrag(event);
        }
    }

    private onTouchEnd(event: EventTouch) {
        this.cancelTouchTimer();

        if (this._isDragging) {
            const manager = this.node.scene.getComponentInChildren(InventoryManager);
            if (manager) {
                // Передаем в менеджер, что мы закончили
                // Мы можем просто вызвать метод из менеджера, который у тебя уже есть
                // (только убедись, что он публичный)
                manager.onGlobalEnd(event); 
            }
        } else {
            const dist = Vec2.distance(this._startTouchPos, event.getUILocation());
            if (dist < 10) this.onClick();
        }
        
        this._isDragging = false;
    }
}