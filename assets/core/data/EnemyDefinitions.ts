export enum ENEMY_INTENT {
    ATTACK = 'attack',
    BUFF = 'buff',
    DEBUFF = 'debuff',
    SUMMON = 'summon',
    FAILURE = 'failure'
}

export interface IEnemyAction {
    intent: ENEMY_INTENT;
    value?: number;
    description: string;
    // Здесь в будущем можно добавить targetType: 'SELF' | 'PLAYER' | 'ALL_PLAYERS'
}

export interface IEnemyDefinition {
    id: string;
    name: string;
    maxHp: number;
    rank: 'LEADER' | 'MINION';
    spriteFrame: string; // Имя кадра в твоем атласе
    group_id?: string; 
    onLeaderDeath?: 'ESCAPE' | 'RAGE'; // Что делает, если лидер группы погиб
    pattern: IEnemyAction[][];
}

export const ENEMY_DATABASE: Record<string, IEnemyDefinition> = {
    "drone_guardian": {
        id: "drone_guardian",
        name: "Дрон-Гвардеец",
        maxHp: 40,
        rank: 'LEADER', 
        spriteFrame: "dron-x02", 
        pattern: [
            [{ intent: ENEMY_INTENT.DEBUFF, description: "Снитяе щита" }],
            [{ intent: ENEMY_INTENT.ATTACK, value: 8, description: "Наносит 8 ед. урона" }]
        ]
    },
    "drone_scout": {
        id: "drone_scout",
        name: "Дрон-Разведчик",
        maxHp: 20,
        rank: 'MINION',
        spriteFrame: "dron-x01",
        pattern: [
            [{ intent: ENEMY_INTENT.ATTACK, value: 5, description: "Лазерный выстрел" }],
        ]
    }
};