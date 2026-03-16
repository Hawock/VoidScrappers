
import { MODULE_TYPE } from "../enums";
import { IModule } from "../interfaces";
import { PROTOCOLS_REGISTRY } from "./Protocols";

export const INTERCEPTOR_MODULES: Record<string, IModule> = {
    //--- ЯДРО ---
    INTERNAL_CORE: {
        id: "M_INT_CORE_INT",
        name: "Вычислительное ядро «Призрак»", 
        type: MODULE_TYPE.CORE, 
        baseProtocols: [
            PROTOCOLS_REGISTRY.P_TACTICAL_MARK_01
        ]
    },
    // --- ОРУЖИЕ ---
    NEEDLE_GUN: {
        id: "m_needle_01",
        name: "Автопушка «Игла»",
        type: MODULE_TYPE.WEAPON,
        baseProtocols: [
            PROTOCOLS_REGISTRY.P_STING
        ]
    },

    // --- ЩИТЫ ---
    SHORTWAVE_GEN: {
        id: "m_shortwave_01",
        name: "Коротковолновый генератор щита",
        type: MODULE_TYPE.SHIELD,
        baseProtocols: [
            PROTOCOLS_REGISTRY.P_GADFLY
        ]
    },

    // --- ДВИГАТЕЛИ ---
    DIVE_ENGINE: {
        id: "m_dive_01",
        name: "Нырковый двигатель",
        type: MODULE_TYPE.ENGINE,
        baseProtocols: [
            PROTOCOLS_REGISTRY.P_SHIFT
        ]
    }
};