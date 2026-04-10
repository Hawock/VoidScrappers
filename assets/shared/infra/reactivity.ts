import { EventTarget } from 'cc';

export class Ref<T> {
    private _raw: T;
    private _proxy: T;
    private _isPending = false; // 1. Добавляем флаг-предохранитель
    public events: EventTarget = new EventTarget();

    constructor(value: T) {
        this._raw = value;
        this._proxy = this.makeReactive(value);
    }

    get value(): T {
        return this._proxy;
    }

    set value(newValue: T) {
        if (this._raw === newValue) return;
        this._raw = newValue;
        this._proxy = this.makeReactive(newValue);
        this.trigger();
    }

    // 2. Модернизируем триггер
    public trigger() {
        // Если уведомление уже запланировано в очереди — выходим
        if (this._isPending) return;

        this._isPending = true;

        // 3. Закидываем задачу в очередь микрозадач
        Promise.resolve().then(() => {
            this.events.emit('changed', this._proxy);
            this._isPending = false; // Сбрасываем флаг, когда всё отработало
        });
    }

    private makeReactive(val: any): any {
        if (val === null || typeof val !== 'object') return val;
        const self = this;
        return new Proxy(val, {
            get(target, prop) {
                const result = target[prop];
                if (typeof result === 'object' && result !== null) {
                    return self.makeReactive(result);
                }
                if (typeof result === 'function') {
                    return result.bind(target);
                }
                return result;
            },
            set(target, prop, newValue) {
                if (target[prop] === newValue) return true;
                target[prop] = newValue;
                self.trigger(); // Тут всё остается так же
                return true;
            }
        });
    }
}

export const ref = <T>(val: T) => new Ref<T>(val);