import { Protocol } from "../../classes/Protocol";
import { IEnemy } from "./IEnemy";
import { IPlayer } from "./IPlayer";

export interface IBattleStatePacket {
    players: IPlayer[]; // Данные по игрокам, их HP, щитам и т.д.
    enemies: IEnemy[]; // Типы врагов, их ID и статы
    initialHand: Protocol[]; // Карты в руке в начале боя
    initialDeck: Protocol[]; // Остаток колоды,
    initialDiscard: Protocol[]; // Сброс 
    initialExhausted: Protocol[]; // Удаленные карты 
}