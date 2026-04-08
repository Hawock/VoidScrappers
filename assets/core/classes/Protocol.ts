import { PROTOCOL_TYPE } from "../enums";
import { ITargetConfig, TARGET_TYPE } from "../enums/BattleTypes";
import { IProtocol } from "../interfaces";
import { IEffect } from "../interfaces/battle/IEffect";

export class Protocol {
    id: string;
    uid: number; // Уникальный ID конкретной карты в руке/колоде
    name: string;
    module_id: string;
    targetConfig: ITargetConfig;
    effects: IEffect[];
    type: PROTOCOL_TYPE;
    cost: number;
    description: string;
    isPlayable: boolean;

    constructor(data: IProtocol, uid: number) {
        this.id = data.id;
        this.uid = uid;
        this.name = data.name;
        this.module_id = data.module_id;
        this.targetConfig = data.targetConfig;
        this.effects = data.effects;
        this.type = data.type;
        this.cost = data.cost;
        this.description = data.description;
        this.isPlayable = data.isPlayable;
    }
}