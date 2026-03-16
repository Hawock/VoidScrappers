import { MODULE_TYPE } from "../enums";
import { IModule } from "./IProtocol";

export interface ISpaceShipSlot {
    type: MODULE_TYPE;         
    installedModule: IModule;
}