import { RARITY } from "../../config/module.enum";
import { IModuleBase } from "../../types/IModuleBase";
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
    isBlueprint: boolean = false;

    get slotType (){
        return this.module.slot.code;
    }
    
    constructor(data: IUserModule | IModuleBase) {
        if("module" in data) { //физические модули
            this.id = data.id;
            this.moduleId = data.moduleId;
            this.module = new ModuleBase(data.module);
            this.rarity = data.rarity;
            this.equippedToId = data.equippedToId;
            this.vanguardSlotId = data.vanguardSlotId;
            this.unlockedProtocols = data.unlockedProtocols;
            this.selectedProtocols = data.selectedProtocols;
        }else{ //чертежи стартовых модулей
            this.id = ""
            this.moduleId = data.id;
            this.module = new ModuleBase(data);
            this.rarity = data.rarity;
            this.equippedToId = "";
            this.vanguardSlotId = "";
            this.unlockedProtocols = data.protocols.filter((p) => {p.rarity === RARITY.STARTER});
            this.selectedProtocols = []
            this.isBlueprint = true;
        }
    }

}