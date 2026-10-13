import { RARITY } from "../../config/module.enum"
import { IModuleBase } from "../../types/IModuleBase"
import { VanguardSLotEnt } from "../../../vanguard-slot/model/classess/vanguard-slot.ent"
import { VanguardEnt } from "../../../vanguard/model/classess/vanguard.ent"
import { ProtocolEnt } from "../../../protocols/model/classess/protocol.ent"

export class ModuleBase {
    id: string
    name: string
    protocols: ProtocolEnt[]
    rarity: RARITY
    slot: VanguardSLotEnt
    slotId: string
    spriteFrame: string
    vanguard: VanguardEnt
    constructor(data: IModuleBase) {
        this.id = data.id;
        this.name = data.name;
        this.protocols = data.protocols.map((protocol) => new ProtocolEnt(protocol));
        this.rarity = data.rarity;
        this.slot = data.slot;
        this.slotId = data.slotId;
        this.spriteFrame = data.spriteFrame;
        this.vanguard = new VanguardEnt(data.vanguard);
    }
}