import { MODULE_TYPE, PROTOCOL_TYPE, TARGET_TYPE } from "../enums";


export interface IProtocol {
    id: string;
    name: string; 
    module_id: string;
    targetType:TARGET_TYPE;
    maxTargets: number;
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