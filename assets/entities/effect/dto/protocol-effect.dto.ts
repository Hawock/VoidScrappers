import { TARGET_TYPE } from "../comfig/target-type.enum"
import { EffectDto } from "./effect.dto";

export interface ProtocolEffectDto {
    id: number;
    protocolId?: string;
    effectId: string;
    value: number;
    duration: number | null;
    chance?: number;
    targetType: TARGET_TYPE | null;
    effect?: EffectDto;
}