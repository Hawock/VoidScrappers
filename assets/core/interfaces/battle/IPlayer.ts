import { SPACE_SHIPS } from "../../enums/SpaceShips.enum";
import { IUnit } from "./iUnit";

export interface IPlayer extends IUnit{
    isMyPlayer: boolean;
    currentEnergy: number;
    maxEnergy: number
    currentSpaceShip: SPACE_SHIPS;
}