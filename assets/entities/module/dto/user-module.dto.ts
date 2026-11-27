import { MODULE_TYPE } from "db://assets/core";
import { RARITY } from "../config/module.enum";
import { ModuleDto } from "./module.dto";

export interface UserModuleDto {
    id: string;
    moduleId: string;
    module: ModuleDto; 
    rarity: RARITY;
    equippedToId: string | null;
    vanguardSlotId: string | null;
    unlockedProtocols: any[]; 
    selectedProtocols: any[]; 
}