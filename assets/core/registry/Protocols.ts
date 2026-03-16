import { PROTOCOL_TYPE, TARGET_TYPE } from "../enums";
import { IProtocol } from "../interfaces";

export const PROTOCOLS_REGISTRY: Record<string, IProtocol> = {
    P_STING_01: {
        id: "P_STING_01",
        module_id: "M_NEEDLE_01",
        name: "Укол",
        type: PROTOCOL_TYPE.ATTACK,
        targetType: TARGET_TYPE.SOME_ENEMIES,
        maxTargets: 1,
        cost: 1,
        isPlayable: true,
        description: "Наносит 5 ед. урона."
    },
    P_GADFLY_01: {
        id: "P_GADFLY_01",
        module_id: "M_VEIL_01",
        name: "Овод",
        type: PROTOCOL_TYPE.SKILL,
        targetType: TARGET_TYPE.SELF,
        maxTargets: 1,
        cost: 1,
        isPlayable: true,
        description: "Дает 4 ед. Щита."
    },
    P_SHIFT_01: {
        id: "P_SHIFT_01",
        module_id: "M_BLITZ_01",
        name: "Сдвиг",
        type: PROTOCOL_TYPE.SKILL,
        targetType: TARGET_TYPE.SELF,
        maxTargets: 1,
        cost: 1,
        isPlayable: true,
        description: "Загрузить 1 протокол."
    },
    P_TACTICAL_MARK_01: {
        id: "P_TACTICAL_MARK_01",
        name: "Тактическая метка",
        module_id: "M_INT_CORE_INT",
        type: PROTOCOL_TYPE.ATTACK,
        targetType: TARGET_TYPE.SOME_ENEMIES,
        maxTargets: 1,
        cost: 2,
        description: "Наносит 8 ед. урона. Накладывает «Уязвимость» на 1 ход.",
        isPlayable: true
    }
};