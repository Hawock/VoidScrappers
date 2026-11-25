import { TARGET_TYPE } from "../../comfig/target-type.enum"
import { EffectDto } from "../../dto/effect.dto";
import { ProtocolEffectDto } from "../../dto/protocol-effect.dto"

export class EffectEnt {
    id: string;
    name: string;
    description: string | null;
    intentType: string | null;
    statusIcon: string | null;
    handlerKey: string;
    hook: string;
    expiration: string;

    constructor(data: EffectDto) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description ?? null;
        this.intentType = data.intentType ?? null;
        this.statusIcon = data.statusIcon ?? null;
        this.handlerKey = data.handlerKey;
        this.hook = data.hook;
        this.expiration = data.expiration;
    }
}