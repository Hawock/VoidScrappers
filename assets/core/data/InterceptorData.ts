import { MODULE_TYPE, PROTOCOL_TYPE } from "../enums";

// Теперь данные Перехватчика просто ссылаются на общие правила
export const INTERCEPTOR_BASE_MODULES = {
    NEEDLE_GUN: {
        id: 'needle_01',
        name: 'Автопушка «Игла»',
        type: MODULE_TYPE.WEAPON,
        baseProtocol: {
            id: 'p_sting',
            name: 'Укол',
            type: PROTOCOL_TYPE.ATTACK,
            cost: 1,
            description: 'Наносит 5 ед. урона.'
        }
    },
    // ... и остальные модули так же
};