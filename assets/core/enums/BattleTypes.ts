// Типы целей
export enum TARGET_TYPE {
    SELF = 'self',
    SOME_ENEMIES = 'some_enemies',
    ALL_ENEMIES = 'all_enemies',
    ALL_ALLIES = 'all_allies'
}

// Время жизни эффекта (то, что мы обсуждали)
export enum EXPIRATION_TYPE {
    INSTANT = 'instant',         // Сразу (урон/хил)
    ONE_TIME = 'one_time',       // До первого срабатывания (заряд)
    END_OF_TURN = 'end_of_turn', // Исчезнет в конце текущего хода
    DURATION = 'duration',       // Висит несколько ходов
    PERMANENT = 'permanent'      // До конца боя
}

// Как именно выбираются цели
export enum TARGET_SELECTION {
    MANUAL = 'manual',   // Игрок тыкает курсором
    RANDOM = 'random',   // Автовыбор случайных целей
    AUTO = 'auto'        // Все доступные (для ALL_ENEMIES / SELF)
}

// Типы хуков
export enum HOOK_TYPE {
    ON_TURN_START = 'on_turn_start',       //в начале хода
    ON_TURN_END = 'on_turn_end',           //в конц хода
    ON_CALCULATE_DAMAGE = 'on_calc_damage', 
    ON_INCOMING_DAMAGE = 'on_take_damage', 
    ON_STATUS_EXPIRED = 'on_expired',      
    ON_HP_CHANGED = 'on_hp_changed'        
}

// Типы самих эффектов 
export enum EFFECT_TYPE {
    DAMAGE = 'damage',
    SHIELD = 'shield',
    ENERGY = 'energy',
    DRAW_CARD = 'draw_card',
    DISCARD_CARD = 'discard_card', 
    APPLY_STATUS = 'apply_status'
}

export enum BATTLE_STATE {
    IDLE = 'idle',               // Ожидание хода игрока
    SELECTING_TARGETS = 'selecting_targets', 
    EXECUTING = 'executing',     // Обработка действий (карт)
    
    // Фазы хода
    PLAYER_TURN_START = 'player_turn_start', // Прокают эффекты (Реген/Яд игрока)
    PLAYER_TURN_END = 'player_turn_end',     // Прокают эффекты конца хода
    
    ENEMY_TURN_START = 'enemy_turn_start',   // Прокают эффекты врага
    ENEMY_TURN_EXECUTE = 'enemy_turn_execute', // Мозг врага решает, что делать
    ENEMY_TURN_END = 'enemy_turn_end'        // Конец хода врага
}

export interface ITargetConfig {
    type: TARGET_TYPE;
    selection: TARGET_SELECTION;
    count: number;       
}