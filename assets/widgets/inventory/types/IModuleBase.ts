import { RARITY } from "../config/module.enum"

export interface IModuleBase {
    id: string
    name: string
    rarity: RARITY
    vanguardId: string
    spriteFrame: string
    slotId: string
}