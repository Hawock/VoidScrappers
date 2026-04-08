import { EventTarget } from 'cc';

export class Ref<T> {
    private _raw: T; // Храним оригинальное значение
    private _proxy: T; // Храним обертку-прокси
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

    public trigger() {
        this.events.emit('changed', this._proxy);
    }

    // Та самая магия под капотом Vue 3
    private makeReactive(val: any): any {
        // Если это примитив (строка, число, boolean) или null — Proxy не нужен
        if (val === null || typeof val !== 'object') {
            return val;
        }

        const self = this;

        return new Proxy(val, {
            // Перехватываем ЧТЕНИЕ свойств
            get(target, prop) {
                const result = target[prop];
                
                // Ленивая глубокая реактивность (Deep Reactivity)
                // Если мы обращаемся к вложенному объекту/массиву, мы его тоже оборачиваем в Proxy на лету!
                if (typeof result === 'object' && result !== null) {
                    return self.makeReactive(result);
                }
                
                // Если обращаемся к функциям массива (push, splice и тд), привязываем контекст
                if (typeof result === 'function') {
                    return result.bind(target);
                }
                
                return result;
            },

            // Перехватываем ИЗМЕНЕНИЕ свойств
            set(target, prop, newValue) {
                // Защита от лишних рендеров, если значение не поменялось
                if (target[prop] === newValue) return true; 

                // Меняем значение в оригинальном объекте
                target[prop] = newValue;
                
                // 🔥 ТРИГГЕРИМ СОБЫТИЕ!
                self.trigger();
                
                return true; // Proxy требует возвращать true при успешной записи
            }
        });
    }
}

export const ref = <T>(val: T) => new Ref<T>(val);