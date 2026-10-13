import { ProtocolDto } from "../../protocols/dto/protocol.dto"
import { VanguardSlotDto } from "../../vanguard-slot/model/dto/vanguard-slot.dto"
import { VanguardDto } from "../../vanguard/dto/vangard.dto"
import { RARITY } from "../config/module.enum"

export interface IModuleBase {
    id: string
    name: string
    protocols: ProtocolDto[]
    rarity: RARITY
    slot: VanguardSlotDto
    slotId: string
    spriteFrame: string
    vanguard: VanguardDto
}