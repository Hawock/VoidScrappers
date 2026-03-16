type StoreDefiner<T> = () => T;

export class PinaColada {
    private static _instance: PinaColada;
    private _stores: Map<string, any> = new Map(); 

    public static get instance(): PinaColada {
        if (!this._instance) this._instance = new PinaColada();
        return this._instance;
    }

    // Тот самый метод-магия как в Pinia
    public useStore<T>(id: string, definer: StoreDefiner<T>): T {
        if (!this._stores.has(id)) {
            this._stores.set(id, definer()); 
        }
        return this._stores.get(id);
    }
}