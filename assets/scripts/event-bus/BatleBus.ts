// BattleEvents.ts
import { EventTarget } from 'cc';
export const battleBus = new EventTarget();

export enum BATTLE_EVENT {
    BATTLE_STARTED = 'battle_started', // Начало битвы
    HAND_UPDATED = 'hand_updated', 
    UNIT_UPDATED = 'unit_updated', // Любое изменение статов юнита
    TRY_PLAY_PROTOCOL = 'try_play_protocol', // Пытаемся активировать протокол
    PLAYER_ENERGY_CHANGED = 'player_energy_changed',
    SYNC_READY_PLAYERS = "SYNC_READY_PLAYERS",
}