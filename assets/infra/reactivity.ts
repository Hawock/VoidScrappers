import { EventTarget } from 'cc';

export class Ref<T> {
    private _value: T;
    // Используем встроенный EventTarget Кокоса для подписок
    public events: EventTarget = new EventTarget();

    constructor(value: T) {
        this._value = value;
    }

    get value(): T {
        return this._value;
    }

    set value(newValue: T) {
        if (this._value === newValue) return;
        this._value = newValue;
        // Оповещаем UI через стандартную систему событий
        this.events.emit('changed', newValue);
    }
    
    public trigger() {
        this.events.emit('changed', this._value);
    }
}

export const ref = <T>(val: T) => new Ref<T>(val);