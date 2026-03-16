// Типы протоколов — поведение (как они разыгрываются)
export enum PROTOCOL_TYPE {
    ATTACK = 'attack', // Мгновенный урон
    SKILL = 'skill',   // Временный эффект (на ход)
    TALENT = 'talent',  // Постоянный эффект (весь бой)
    FAILURE = 'failure' //Сбой/вирус
}

export enum TARGET_TYPE {
    SELF = 'self',                   // На себя (щиты, движки)
    SOME_ENEMIES = 'some_enemies',   // Выбор нескольких врагов (курсором)
    ALL_ENEMIES = 'all_enemies',     // Удар по всем врагам (автоматом)
    SOME_ALLIES = 'some_allies',     // На нескольких союзников (в будущем для ПвП/коопа)
    ALL_ALLIES = 'all_allies',       // На всю свою команду
}