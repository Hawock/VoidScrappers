import { Protocol } from "../classes/Protocol";
import { IProtocol } from "../interfaces";
import { INTERCEPTOR_MODULES, PROTOCOLS_REGISTRY } from "../registry";

export enum SPACE_SHIPS {
    INTERCEPTOR = 'interceptor',
    BOMBER = 'bomber',
    DREDNOUT = 'drednout',
    PULSAR = 'pulsar'
}

export const SPACE_SHIP_NAMES = {
    [SPACE_SHIPS.INTERCEPTOR]: 'Перехватчик',
    [SPACE_SHIPS.BOMBER]: 'Бомбардировщик',
    [SPACE_SHIPS.DREDNOUT]: 'Дредноут',
    [SPACE_SHIPS.PULSAR]: 'Пульсар'
};

export const SPACE_SHIP_BASE_STATS = {
    [SPACE_SHIPS.INTERCEPTOR]: { maxHp: 70, startShield: 0, slots: { weapons: 2, engines: 1, shields: 1 } },
    [SPACE_SHIPS.BOMBER]: { maxHp: 90, startShield: 0, slots: { weapons: 2, engines: 1, shields: 1 } },
    [SPACE_SHIPS.DREDNOUT]: { maxHp: 100, startShield: 5, slots: { weapons: 1, engines: 1, shields: 2 } },
    [SPACE_SHIPS.PULSAR]: { maxHp: 80, startShield: 2, slots: { weapons: 1, engines: 2, shields: 1 } }
};

export const START_EQUIPMENT = {
    [SPACE_SHIPS.INTERCEPTOR]:
        [
            INTERCEPTOR_MODULES.INTERNAL_CORE,
            INTERCEPTOR_MODULES.NEEDLE_GUN,
            INTERCEPTOR_MODULES.NEEDLE_GUN,
            INTERCEPTOR_MODULES.SHORTWAVE_GEN,
            INTERCEPTOR_MODULES.DIVE_ENGINE
        ]
};

export const PREPARED_RAID_DECK = {
    [SPACE_SHIPS.INTERCEPTOR]: [
        // Ядро: 1 уникальный протокол
        PROTOCOLS_REGISTRY.P_TACTICAL_MARK_01,

        // Оружие 1: выбрали 3 "Укола"
        PROTOCOLS_REGISTRY.P_STING_01,
        PROTOCOLS_REGISTRY.P_STING_01,
        PROTOCOLS_REGISTRY.P_STING_01,

        // Оружие 2: выбрали еще 3 "Укола"
        PROTOCOLS_REGISTRY.P_STING_01,
        PROTOCOLS_REGISTRY.P_STING_01,
        PROTOCOLS_REGISTRY.P_STING_01,

        // Щит: выбрали 3 "Овода"
        PROTOCOLS_REGISTRY.P_GADFLY_01,
        PROTOCOLS_REGISTRY.P_GADFLY_01,
        PROTOCOLS_REGISTRY.P_GADFLY_01,

        // Двигатель: выбрали 3 "Сдвига"
        PROTOCOLS_REGISTRY.P_SHIFT_01,
        PROTOCOLS_REGISTRY.P_SHIFT_01,
        PROTOCOLS_REGISTRY.P_SHIFT_01
    ]
};


export function setStartEquipment(spaceShip: SPACE_SHIPS) {
    return START_EQUIPMENT[spaceShip];
}

export function getRaidProtocols(shipType: SPACE_SHIPS): Protocol[] {
    return (PREPARED_RAID_DECK[shipType] || []).map((p, index) => {
        return new Protocol(p, index + 301);
    })
}