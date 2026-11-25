// protocol-effect.ent.ts
import { TARGET_TYPE } from "../../comfig/target-type.enum";
import { ProtocolEffectDto } from "../../dto/protocol-effect.dto";
import { EffectEnt } from "./effect.ent";

export class ProtocolEffectEnt {
    id: number;
    protocolId?: string;
    effectId: string;
    value: number;
    duration: number | null;
    chance: number;
    targetType: TARGET_TYPE | null;
    effect: EffectEnt | null;

    constructor(data: ProtocolEffectDto) {
        this.id = data.id;
        this.protocolId = data.protocolId;
        this.effectId = data.effectId;
        this.value = data.value;
        this.duration = data.duration;
        this.chance = data.chance ?? 1;
        this.targetType = data.targetType;
        this.effect = data.effect ? new EffectEnt(data.effect) : null;
    }

    get name(): string {
        return this.effect?.name ?? this.effectId;
    }

    get description(): string | null {
        return this.effect?.description ?? null;
    }

    get intentType(): string | null {
        return this.effect?.intentType ?? null;
    }

    get statusIcon(): string | null {
        return this.effect?.statusIcon ?? null;
    }
}