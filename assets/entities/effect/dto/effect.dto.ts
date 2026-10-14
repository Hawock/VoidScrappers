import { TARGET_TYPE } from "../comfig/target-type.enum"

export interface EffectDto {
    duration: number | null
    effectId: string
    id: number
    targetType: TARGET_TYPE | null
    value: number
}