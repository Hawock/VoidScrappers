import { _decorator, Component, EventTouch, Input, input, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('InventoryManager')
export class InventoryManager extends Component {
    @property(Node) dragVisual: Node = null!;

    onLoad() {
        // Скрываем призрака при старте
        this.dragVisual.active = false;

        // Слушаем глобальное перемещение
        input.on(Input.EventType.TOUCH_MOVE, this.onGlobalMove, this);
        input.on(Input.EventType.TOUCH_END, this.onGlobalEnd, this);
    }

    private onGlobalMove(event: EventTouch) {
        if (!this.dragVisual.active) return;

        // Двигаем призрака за пальцем
        const pos = event.getUILocation();
        this.dragVisual.setWorldPosition(pos.x, pos.y, 0);
    }

    private onGlobalEnd(event: EventTouch) {
    if (!this.dragVisual.active) return;

    // 1. Сразу прячем "призрака" и возвращаем скролл инвентарю
    this.dragVisual.active = false;
    this.inventoryScroll.enabled = true;

    // 2. Проверяем, попали ли мы в какой-нибудь слот Авангарда
    // Мы можем использовать глобальный поиск или систему событий.
    // Самый простой путь: спросить у всех слотов, находится ли точка отпускания над ними.
    
    let droppedSuccessfully = false;
    const touchPos = event.getUILocation(); // Мировые координаты тача

    for (const slot of this.allVanguardSlots) {
        // Проверяем попадание точки в прямоугольник слота
        if (slot.getComponent(UITransform).getComputeBoundingBoxWorld().contains(touchPos)) {
            
            // Если попали — вызываем у слота метод приема предмета
            const success = slot.handleDrop(this._draggedData);
            
            if (success) {
                droppedSuccessfully = true;
                this.onEquipSuccess(); // Логика успешной экипировки
            }
            break; 
        }
    }

    // 3. Если никуда не попали (или тип модуля не подошел)
    if (!droppedSuccessfully) {
        this.returnItemToInventory();
    }

    // Очищаем временные данные таскания
    this._draggedData = null;
}
}


