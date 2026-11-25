import { PinaColada } from "../PinaColada";
import { extractStoreSnapshot, StoreInspectorEntry } from "./store-snapshot";

export class StoreDevtoolsService {
    public static getStoreIds(): string[] {
        const storesMap = (PinaColada.instance as any)._stores as Map<string, any>;
        return storesMap ? Array.from(storesMap.keys()) : [];
    }

    public static getSnapshot(storeId: string): StoreInspectorEntry | null {
        const storesMap = (PinaColada.instance as any)._stores as Map<string, any>;
        const store = storesMap?.get(storeId);
        if (!store) return null;
        return extractStoreSnapshot(storeId, store);
    }

    public static getAllSnapshots(): StoreInspectorEntry[] {
        return this.getStoreIds()
            .map((id) => this.getSnapshot(id))
            .filter((item): item is StoreInspectorEntry => item !== null);
    }

    public static exposeToWindow(): void {
        if (typeof window === "undefined") return;
        (window as any).__PINACOLADA_DEVTOOLS__ = {
            ids: () => this.getStoreIds(),
            get: (id: string) => this.getSnapshot(id),
            all: () => this.getAllSnapshots(),
        };
    }
}


