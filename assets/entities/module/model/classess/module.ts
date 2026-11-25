import { ProtocolEnt } from "../../../protocols/model/classess/protocol.ent";
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
    unlockedProtocols: ProtocolEnt[];
    selectedProtocols: ProtocolEnt[];
    isBlueprint: boolean = false;

    get slotType() {
        return this.module.slot.code;
    }

    get maxProtocols(): number {
        const fromSlot = (this.module.slot as any)?.maxProtocols;
        if (typeof fromSlot === 'number') return fromSlot;
        return this.slotType?.toUpperCase() === 'CORE' ? 1 : 3;
    }

    constructor(data: IUserModule | IModuleBase) {
        if ("module" in data) { //физические модули
            this.id = data.id;
            this.moduleId = data.moduleId;
            this.module = new ModuleBase(data.module);
            this.rarity = data.rarity;
            this.equippedToId = data.equippedToId;
            this.vanguardSlotId = data.vanguardSlotId;
            this.unlockedProtocols = (data.unlockedProtocols || []).map(
                (item) => new ProtocolEnt(item.protocol),
            );
            this.selectedProtocols = (data.selectedProtocols || []).map(
                (item) => new ProtocolEnt(item.protocol),
            );
        } else { //чертежи стартовых модулей
            this.id = ""
            this.moduleId = data.id;
            this.module = new ModuleBase(data);
            this.rarity = data.rarity;
            this.equippedToId = "";
            this.vanguardSlotId = "";
            this.unlockedProtocols = (data.protocols || [])
                .filter((p) => p.rarity === RARITY.STARTER)
                .map((p) => new ProtocolEnt(p));
            this.selectedProtocols = []
            this.isBlueprint = true;
        }
    }

}