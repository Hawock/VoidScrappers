import { Ref } from "../reactivity";

export interface StoreInspectorEntry {
    id: string;
    state: Record<string, unknown>;
    actions: string[];
}

export function extractStoreSnapshot(id: string, store: Record<string, any>): StoreInspectorEntry {
    const state: Record<string, unknown> = {};
    const actions: string[] = [];

    if (!store || typeof store !== "object") {
        return { id, state, actions };
    }

    const seenKeys = new Set<string>();
    let current: object | null = store;

    while (current && current !== Object.prototype) {
        for (const key of Object.getOwnPropertyNames(current)) {
            if (key === "constructor" || seenKeys.has(key)) continue;
            seenKeys.add(key);

            const descriptor = Object.getOwnPropertyDescriptor(current, key);
            if (!descriptor) continue;

            // Если это getter — читаем безопасно
            if (typeof descriptor.get === "function") {
                try {
                    const getterVal = descriptor.get.call(store);
                    if (typeof getterVal !== "function") {
                        state[key] = serializeValue(getterVal, new WeakSet<object>(), 0);
                    }
                } catch {
                    state[key] = "[GetterError]";
                }
                continue;
            }

            const val = descriptor.value;
            if (typeof val === "function") {
                actions.push(key);
                continue;
            }

            state[key] = serializeValue(val, new WeakSet<object>(), 0);
        }
        current = Object.getPrototypeOf(current);
    }

    return { id, state, actions };
}

function serializeValue(val: unknown, seen: WeakSet<object>, depth: number): unknown {
    if (depth > 20) return "[MaxDepth]";
    if (val === null || val === undefined) return val;
    if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
        return val;
    }
    if (typeof val === "function") {
        return `[fn ${val.name || "anonymous"}]`;
    }
    if (val instanceof Ref) {
        return serializeValue(val.value, seen, depth + 1);
    }
    if (typeof val === "object") {
        const obj = val as object;
        if (seen.has(obj)) return "[Circular]";

        // Защита от тяжёлых объектов Cocos (Node / Component / EventTarget)
        const ctorName = (obj as any)?.constructor?.name;
        if (ctorName === "Node" || ctorName === "Component") {
            return `[${ctorName}: ${(obj as any).name || "unnamed"}]`;
        }

        seen.add(obj);
        if (obj instanceof Map) {
            const mapObj: Record<string, unknown> = {};
            obj.forEach((v, k) => {
                mapObj[String(k)] = serializeValue(v, seen, depth + 1);
            });
            return mapObj;
        }

        if (obj instanceof Set) {
            return Array.from(obj.values()).map((item) => serializeValue(item, seen, depth + 1));
        }
        if (Array.isArray(obj)) {
            return obj.map((item) => serializeValue(item, seen, depth + 1));
        }

        const out: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(obj)) {
            if (k.startsWith("_") || k === "events") continue;
            if (typeof v === "function") continue;
            out[k] = serializeValue(v, seen, depth + 1);
        }
        return out;
    }

    return String(val);
}