import { SPACE_SHIPS } from "../enums";
import { ISpaceShipSlot } from "./ISpaceShipSlot";

export interface ISpaceShip {
    maxHp: number;
    slots: ISpaceShipSlot[];
}