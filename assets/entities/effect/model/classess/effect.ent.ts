import { TARGET_TYPE } from "../../comfig/target-type.enum"
import { EffectDto } from "../../dto/effect.dto"

export class EffectEnt {
    duration: number | null
    effectId: string
    id: number
    targetType: TARGET_TYPE | null
    value: number

    constructor(data: EffectDto) {
        this.duration = data.duration;
        this.effectId = data.effectId;
        this.id = data.id;
        this.targetType = data.targetType;
        this.value = data.value;
    }
}