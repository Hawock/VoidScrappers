import { PROTOCOL_TYPE } from "../enums";
import { EFFECT_TYPE, EXPIRATION_TYPE, TARGET_SELECTION, TARGET_TYPE } from "../enums/BattleTypes";
import { IProtocol } from "../interfaces";

export const PROTOCOLS_REGISTRY: Record<string, IProtocol> = {
    // 1. Простая атака
    P_STING_01: {
        id: "P_STING_01",
        module_id: "M_NEEDLE_01",
        name: "Укол",
        type: PROTOCOL_TYPE.ATTACK,
        cost: 1,
        isPlayable: true,
        description: "Наносит 5 ед. урона.",
        targetConfig: { type: TARGET_TYPE.SOME_ENEMIES, selection: TARGET_SELECTION.MANUAL, count: 1 },
        effects: [
            { type: EFFECT_TYPE.DAMAGE, value: 5 }
        ]
    },

    // 2. Щит на себя
    P_GADFLY_01: {
        id: "P_GADFLY_01",
        module_id: "M_VEIL_01",
        name: "Овод",
        type: PROTOCOL_TYPE.SKILL,
        cost: 1,
        isPlayable: true,
        description: "Дает 4 ед. Щита.",
        targetConfig: { type: TARGET_TYPE.SELF, selection: TARGET_SELECTION.AUTO, count: 1 },
        effects: [
            { type: EFFECT_TYPE.SHIELD, value: 4 }
        ]
    },

    // 3. Добор карты (Сдвиг)
    P_SHIFT_01: {
        id: "P_SHIFT_01",
        module_id: "M_BLITZ_01",
        name: "Сдвиг",
        type: PROTOCOL_TYPE.SKILL,
        cost: 1,
        isPlayable: true,
        description: "Загрузить 1 протокол.",
        targetConfig: { type: TARGET_TYPE.SELF, selection: TARGET_SELECTION.AUTO, count: 1 },
        effects: [
            { type: EFFECT_TYPE.DRAW_CARD, value: 1 }
        ]
    },

    // 4. Сложная карта: Урон + Статус
    P_TACTICAL_MARK_01: {
        id: "P_TACTICAL_MARK_01",
        name: "Тактическая метка",
        module_id: "M_INT_CORE_INT",
        type: PROTOCOL_TYPE.ATTACK,
        cost: 2,
        isPlayable: true,
        description: "Наносит 8 ед. урона. Накладывает «Уязвимость» на 1 ход.",
        targetConfig: { type: TARGET_TYPE.SOME_ENEMIES, selection: TARGET_SELECTION.MANUAL, count: 1 },
        effects: [
            { type: EFFECT_TYPE.DAMAGE, value: 8 },
            { 
                type: EFFECT_TYPE.APPLY_STATUS, 
                value: 1, 
                params: { 
                    statusId: "VULNERABLE", 
                    duration: 1, 
                    expiration: EXPIRATION_TYPE.END_OF_TURN 
                } 
            }
        ]
    }
};