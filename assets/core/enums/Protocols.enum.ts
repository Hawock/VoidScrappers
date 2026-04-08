// Типы протоколов — поведение (как они разыгрываются)
export enum PROTOCOL_TYPE {
    ATTACK = 'attack', // Мгновенный урон
    SKILL = 'skill',   // Временный эффект (на ход)
    TALENT = 'talent',  // Постоянный эффект (весь бой)
    FAILURE = 'failure' //Сбой/вирус
}
