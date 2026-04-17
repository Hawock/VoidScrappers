import { MODULE_TYPE } from "db://assets/core";
import { RARITY } from "../config/module.enum";
import { IModuleBase } from "./IModuleBase";

export interface IUserModule {
    id: string;
    moduleId: string;
    module: IModuleBase; 
    rarity: RARITY;
    equippedToId: string | null;
    vanguardSlotId: string | null;
    unlockedProtocols: any[]; 
    selectedProtocols: any[]; 
}