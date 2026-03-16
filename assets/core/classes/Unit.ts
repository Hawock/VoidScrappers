import { BATTLE_EVENT, battleBus } from "../../scripts/event-bus/BatleBus";
import { IUnit } from "../interfaces/battle/iUnit";

export class Unit {
    public id: string;
    public uid: number;
    public name: string;
    private _currentHp: number = 0;
    private _maxHp: number = 100;
    private _shield: number = 0;
    public effects?: any[] = [];

    constructor(unit: IUnit) {
        this.id = unit.id;
        this.uid = unit.uid;
        this.name = unit.name;
        this._maxHp = unit.maxHp;
        this._currentHp = this.maxHp;
        this.shield = unit.shield;
        this.effects = unit.effects ?? [];
    }

    // --- ГЕТТЕРЫ ---
    get currentHp() { return this._currentHp; }
    get maxHp() { return this._maxHp; }
    get shield() { return this._shield; }

    // --- СЕТТЕРЫ ---
    set currentHp(value: number) {
        // Логика: зажимаем значение между 0 и MaxHP
        const oldVal = this._currentHp;
        this._currentHp = Math.max(0, Math.min(value, this._maxHp));

        // Если значение реально изменилось — сообщаем миру
        if (oldVal !== this._currentHp) {
            this.notifyUpdate();
        }
    }

    set shield(value: number) {
        this._shield = Math.max(0, value);
        this.notifyUpdate();
    }

    // Вспомогательный метод, чтобы не дублировать код
    private notifyUpdate() {
        battleBus.emit(BATTLE_EVENT.UNIT_UPDATED, { id: this.uid, data: this });
    }
}