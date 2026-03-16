import { ENEMY_INTENT } from "../../data/EnemyDefinitions";
import { IUnit } from "./iUnit";

export interface IEnemy extends IUnit {
    id: string; 
    currentPatternIndex?: number;
    spriteFrame: string;
    nextActions: {
        intent: ENEMY_INTENT;
        value: number;
        description: string;
    }[]; 
}