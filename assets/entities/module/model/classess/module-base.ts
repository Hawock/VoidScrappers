import { RARITY } from "../../config/module.enum"
import { IModuleBase } from "../../types/IModuleBase"

export class ModuleBase {
    id: string = ""
    name: string = ""
    rarity: RARITY = RARITY.STARTER
    vanguardId: string = ""
    spriteFrame: string = ""
    slotId: string = ""

    constructor(data: IModuleBase) {
        this.id = data.id;
        this.name = data.name;
        this.rarity = data.rarity;
        this.vanguardId = data.vanguardId;
        this.spriteFrame = data.spriteFrame;
        this.slotId = data.slotId;
    }
}