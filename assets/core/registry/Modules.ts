import { MODULE_TYPE } from "../enums";
import { PROTOCOLS_REGISTRY } from "./Protocols";

export const MODULES_REGISTRY = {
    M_NEEDLE_01: {
        id: "M_NEEDLE_01",
        name: "Автопушка «Игла»",
        type: MODULE_TYPE.WEAPON,

        baseProtocols: [
            PROTOCOLS_REGISTRY.P_STING_01
        ]
    },
    M_VEIL_01: {
        id: "M_VEIL_01",
        name: "Генератор «Вуаль»",
        type: MODULE_TYPE.SHIELD,
        baseProtocols: [
            PROTOCOLS_REGISTRY.P_GADFLY_01
        ]
    },
    M_BLITZ_01: {
        id: "M_BLITZ_01",
        name: "Привод «Блиц»",
        type: MODULE_TYPE.ENGINE,
        baseProtocols: [
            PROTOCOLS_REGISTRY.P_SHIFT_01
        ]
    }
}