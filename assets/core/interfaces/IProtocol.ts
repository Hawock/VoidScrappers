import { MODULE_TYPE, PROTOCOL_TYPE } from "../enums";
import { ITargetConfig, TARGET_TYPE } from "../enums/BattleTypes";
import { IEffect } from "./battle/IEffect";


export interface IProtocol {
    id: string;
    name: string; 
    module_id: string;
    targetConfig: ITargetConfig; 
    effects: IEffect[]; 
    type: PROTOCOL_TYPE;
    cost: number;
    description: string;
    isPlayable: boolean;
}
export interface IModule {
    id: string;
    name: string;
    type: MODULE_TYPE;
    baseProtocols: IProtocol[]; 
}