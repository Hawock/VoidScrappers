import { ENEMY_INTENT, IEnemyAction } from "../../data/EnemyDefinitions";
import { IUnit } from "./iUnit";

export interface IEnemy extends IUnit {
    id: string; 
    currentPatternIndex?: number;
    spriteFrame: string;
    nextActions:IEnemyAction[];
}