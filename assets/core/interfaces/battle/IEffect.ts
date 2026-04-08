import { EFFECT_TYPE, EXPIRATION_TYPE, HOOK_TYPE, ITargetConfig } from "../../enums/BattleTypes";

export interface IEffect {
    type: EFFECT_TYPE;
    value: number;
    // Если это поле есть — эффект идет сюда. 
    // Если его нет — эффект идет в тех, кого выбрал Протокол.
    targetConfig?: ITargetConfig; 
    params?: {
        statusId?: string;
        expiration: EXPIRATION_TYPE;
        hook?: HOOK_TYPE;
        duration?: number;
    };
}