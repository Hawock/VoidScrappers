import { EffectDto } from "../../../effect/dto/effect.dto"
import { EffectEnt } from "../../../effect/model/classess/effect.ent"
import { RARITY } from "../../../module/config/module.enum"
import { PROTOCOL_USAGE_TYPE } from "../../config/protocol-usage-type.enum"

export class ProtocolEnt {
    cost: number
    description: string
    groupId: string
    id: string
    isPlayable: boolean
    level: number
    moduleId: string
    name: string
    nextId: string | null
    rarity: RARITY
    spriteFrame: string | null
    targetCount: number
    type: string
    usageType: PROTOCOL_USAGE_TYPE
    effects: EffectEnt[]

    constructor(data: any) {
        this.cost = data.cost;
        this.description = data.description;
        this.groupId = data.groupId;
        this.id = data.id;
        this.isPlayable = data.isPlayable;
        this.level = data.level;
        this.moduleId = data.moduleId;
        this.name = data.name;
        this.nextId = data.nextId;
        this.rarity = data.rarity;
        this.spriteFrame = data.spriteFrame;
        this.targetCount = data.targetCount;
        this.type = data.type;
        this.usageType = data.usageType;
        this.effects = data.effects.map((effect) => new EffectEnt(effect));
    }
}