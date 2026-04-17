import { RARITY } from "../../config/module.enum";
import { IUserModule } from "../../types/IUserModule";
import { ModuleBase } from "./module-base";

export class UserModule {
    id: string;
    moduleId: string;
    module: ModuleBase; 
    rarity: RARITY = RARITY.STARTER;
    equippedToId: string | null;
    vanguardSlotId: string | null;
    unlockedProtocols: any[]; 
    selectedProtocols: any[]; 

    constructor(data: IUserModule) {
        this.id = data.id;
        this.moduleId = data.moduleId;
        this.module = new ModuleBase(data.module);
        this.rarity = data.rarity;
        this.equippedToId = data.equippedToId;
        this.vanguardSlotId = data.vanguardSlotId;
        this.unlockedProtocols = data.unlockedProtocols;
        this.selectedProtocols = data.selectedProtocols;
    }

}