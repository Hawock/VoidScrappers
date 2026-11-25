import { ProtocolEffectDto } from "../../effect/dto/protocol-effect.dto";
import { RARITY } from "../../module/config/module.enum";
import { PROTOCOL_USAGE_TYPE } from "../config/protocol-usage-type.enum";

export interface ProtocolDto {
    cost: number;
    description: string | null;
    groupId: string;
    id: string;
    isPlayable: boolean;
    level: number;
    moduleId: string | null;
    name: string;
    nextId: string | null;
    rarity: RARITY;
    spriteFrame: string | null;
    targetCount: number;
    type: string;
    usageType: PROTOCOL_USAGE_TYPE;
    effects?: ProtocolEffectDto[];
}