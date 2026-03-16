import { PROTOCOL_TYPE, TARGET_TYPE } from "../enums";
import { IProtocol } from "../interfaces";

export class Protocol {
    id: string;
    uid: number;
    name: string;
    module_id: string;
    targetType: TARGET_TYPE;
    maxTargets: 0;
    type: PROTOCOL_TYPE;
    cost: number;
    description: string;
    isPlayable: boolean;

    constructor(protocol: IProtocol, uid: number) {
        this.id = protocol.id;
        this.uid = uid;
        this.name = protocol.name;
        this.module_id = protocol.module_id;
        this.targetType = protocol.targetType;
        this.type = protocol.type;
        this.cost = protocol.cost;
        this.description = protocol.description;
        this.isPlayable = protocol.isPlayable;
    }
}