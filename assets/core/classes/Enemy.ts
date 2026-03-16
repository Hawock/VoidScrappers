import { IEnemy } from "../interfaces/battle/IEnemy";
import { Unit } from "./Unit";
import { ENEMY_DATABASE, ENEMY_INTENT } from "../data/EnemyDefinitions";

export class Enemy extends Unit {
    public currentPatternIndex?: number = 0;
    public nextActions:{
        intent: ENEMY_INTENT;
        value: number;
        description: string;
    }[] = [];
    public spriteFrame: string = '';

    constructor(enemy: IEnemy) {
        super(enemy);
        // Синхронизируем индекс (важно при создании из данных сервера/стора)
        this.spriteFrame = enemy.spriteFrame;
        this.currentPatternIndex = enemy.currentPatternIndex ?? 0;
        this.nextActions = enemy.nextActions || [];
    }

}