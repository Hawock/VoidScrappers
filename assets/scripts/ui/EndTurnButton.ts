import { _decorator, Component, EventHandler, EventTouch, Node, Sprite, SpriteAtlas, EventMouse } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EndTurnButton')
export class EndTurnButton extends Component {
    @property(Sprite) public buttonSprite: Sprite = null!;
    @property(SpriteAtlas) public buttonAtlas: SpriteAtlas = null!;
    
    // Нода-детектор (может быть больше самой кнопки)
    @property({ type: Node }) public clickArea: Node = null!;

    @property({ type: [EventHandler], tooltip: "События при клике" }) 
    public clickEvents: EventHandler[] = [];

    private isHovered: boolean = false;
    private isPressed: boolean = false;
    private isToggled: boolean = false; // Визуальное состояние "кнопка вжата"

    onEnable() {
        // Ховеры оставляем на Mouse (для ПК)
        this.clickArea.on(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.clickArea.on(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);

        // Клик переводим на Touch (универсально)
        this.clickArea.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.clickArea.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.clickArea.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    protected onDisable(): void {
        this.clickArea.off(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.clickArea.off(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
        this.clickArea.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.clickArea.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.clickArea.off(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
    }

    /**
     * Вызывается из BattleManager, чтобы синхронизировать вид со Стором
     */
    public setVisualState(isReady: boolean) {
        this.isToggled = isReady;
        this.updateVisuals();
    }

    private updateVisuals() {
        if (!this.buttonSprite || !this.buttonAtlas) return;
        
        let frameName = '';

        // Приоритет визуализации
        if (this.isPressed) {
            // Если кнопка уже была активна, при нажатии показываем "отжатую" и наоборот (инверсия намерения)
            frameName = this.isToggled ? 'End_turn_button_s' : 'End_turn_button_c';
        } else if (this.isHovered) {
            frameName = 'End_turn_button_o';
        } else {
            // В покое: 'c' (вжата) или 's' (стандарт)
            frameName = this.isToggled ? 'End_turn_button_c' : 'End_turn_button_s';
        }

        const frameToUse = this.buttonAtlas.getSpriteFrame(frameName);
        if (frameToUse) {
            this.buttonSprite.spriteFrame = frameToUse;
        }
    }

    // --- HOVER LOGIC ---
    private onMouseEnter(event: EventMouse) {
        this.isHovered = true;
        this.updateVisuals();
    }

    private onMouseLeave(event: EventMouse) {
        this.isHovered = false;
        this.isPressed = false; // Сбрасываем нажатие, если палец/мышь ушли с кнопки
        this.updateVisuals();
    }

    // --- TOUCH LOGIC ---
    private onTouchStart(event: EventTouch) {
        this.isPressed = true;
        this.updateVisuals();
    }

    private onTouchEnd(event: EventTouch) {
        if (this.isPressed) {
            // Вызываем события, настроенные в инспекторе
            EventHandler.emitEvents(this.clickEvents, event);
        }
        this.isPressed = false;
        this.isToggled = !this.isToggled;
        this.updateVisuals();
    }

    private onTouchCancel(event: EventTouch) {
        this.isPressed = false;
        this.updateVisuals();
    }
}