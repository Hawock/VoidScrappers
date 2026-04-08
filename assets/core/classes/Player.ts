import { SPACE_SHIPS } from "../enums";
import { getRaidProtocols } from "../enums/SpaceShips.enum";
import { IPlayer, IProtocol } from "../interfaces";
import { Unit } from "./Unit";



export class Player extends Unit {
    public energy: number = 3; // Базовая энергия на ход
    public currentEnergy: number = 0;
    public isMyPlayer: boolean = false;
    // Списки протоколов (твоя колода)
    public drawPile: IProtocol[] = [];    // Колода (откуда берем)
    public hand: IProtocol[] = [];        // Рука (что видим на экране)
    public discardPile: IProtocol[] = []; // Сброс (куда улетает после хода)

    // Мета-данные сессии
    public shipType: SPACE_SHIPS;

    constructor(player: IPlayer) {
        super(player);
        console.log("Creating Player:", player);
        this.shipType = player.currentSpaceShip;
        this.currentEnergy = this.energy;
        this.isMyPlayer = player.isMyPlayer;
    }

    /**
     * Загрузка протоколов из "ангара" в боевую систему
     */
    public prepareForBattle() {
        // Получаем те самые 13 протоколов, о которых договорились
        const baseProtocols = getRaidProtocols(this.shipType);
        
        // Клонируем их в drawPile (колоду)
        this.drawPile = baseProtocols.map(p => ({ ...p }));
        
        // Тут в будущем будет shuffle(this.drawPile)
        console.log(`[Battle] Игрок готов. Колода: ${this.drawPile.length} шт.`);
    }
}