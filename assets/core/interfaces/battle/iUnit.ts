export interface IUnit {
    id: string;
    name: string;
    uid: number;
    currentHp: number;
    maxHp: number;
    shield: number;
    effects?: any[];
}