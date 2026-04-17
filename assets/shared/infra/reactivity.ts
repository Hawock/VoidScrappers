import { EventTarget } from 'cc';

// Глобальная переменная для отслеживания текущего контекста (наблюдателя)
let activeEffect: (() => void) | null = null;

export class Ref<T> {
    private _raw: T;
    private _proxy: T;
    private _isPending = false;
    private _autoDeps: Set<() => void> = new Set(); // Сет для эффектов (computed/watch)
    public events: EventTarget = new EventTarget();

    constructor(value: T) {
        this._raw = value;
        this._proxy = this.makeReactive(value);
    }

    get value(): T {
        // МАГИЯ: Если сейчас выполняется какой-то computed, он "подпишется" на этот ref
        if (activeEffect) {
            this._autoDeps.add(activeEffect);
        }
        return this._proxy;
    }

    set value(newValue: T) {
        if (this._raw === newValue) return;
        this._raw = newValue;
        this._proxy = this.makeReactive(newValue);
        this.trigger();
    }

    public trigger() {
        if (this._isPending) return;
        this._isPending = true;

        Promise.resolve().then(() => {
            // 1. Уведомляем ручные подписки (UI)
            this.events.emit('changed', this._proxy);
            
            // 2. Уведомляем автоматические зависимости (computed)
            this._autoDeps.forEach(effect => effect());
            
            this._isPending = false;
        });
    }

    private makeReactive(val: any): any {
        if (val === null || typeof val !== 'object') return val;
        const self = this;
        return new Proxy(val, {
            get(target, prop) {
                // Глубокое отслеживание: если мы читаем свойство объекта внутри computed
                if (activeEffect) {
                    self._autoDeps.add(activeEffect);
                }

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
                self.trigger();
                return true;
            }
        });
    }
}

export const ref = <T>(val: T) => new Ref<T>(val);

export function watch<T>(source: Ref<T>, cb: (newValue: T) => void) {
    source.events.on('changed', cb);
    return () => source.events.off('changed', cb);
}

/**
 * УМНЫЙ COMPUTED:
 * Теперь не нужен второй параметр deps!
 */
export function computed<T>(getter: () => T) {
    // Инициализируем реф пустым значением
    const result = ref<T>(null as any);

    // Обертка-эффект, которая будет перезапускаться
    const runner = () => {
        activeEffect = runner; // Ставим себя в глобальный трекер
        result.value = getter(); // Выполняем геттер (рефы внутри сами подпишут runner)
        activeEffect = null;    // Сбрасываем трекер
    };

    // Запускаем первый раз для сбора зависимостей и получения значения
    runner();

    return result;
}