import { ProtocolEffectEnt } from "../../../effect/model/classess/protocol-effect.ent";
import { RARITY } from "../../../module/config/module.enum";
import { PROTOCOL_USAGE_TYPE } from "../../config/protocol-usage-type.enum";
import { ProtocolDto } from "../../dto/protocol.dto";

const INTENT_COLORS: Record<string, string> = {
    ATTACK: '#FF5A5A',   // Красный — урон
    DEFEND: '#4DA6FF',   // Синий — защита/броня
    BUFF: '#4DD0E1',     // Голубой — баффы
    HEAL: '#66BB6A',     // Зелёный — лечение
    DEBUFF: '#FFA726',   // Оранжевый — дебаффы
    GLITCH: '#CE93D8',   // Фиолетовый — сбои
    SPECIAL: '#FFD54F',  // Жёлтый — особые эффекты
};

export class ProtocolEnt {
    cost: number;
    description: string | null;
    groupId: string;
    id: string;
    isPlayable: boolean;
    level: number;
    moduleId: string | null;
    name: string;
    nextId: string | null;
    rarity: RARITY;
    spriteFrame: string | null;
    targetCount: number;
    type: string;
    usageType: PROTOCOL_USAGE_TYPE;
    effects: ProtocolEffectEnt[];

    constructor(data: ProtocolDto) {
        this.cost = data.cost;
        this.description = data.description;
        this.groupId = data.groupId;
        this.id = data.id;
        this.isPlayable = data.isPlayable;
        this.level = data.level;
        this.moduleId = data.moduleId;
        this.name = data.name;
        this.nextId = data.nextId;
        this.rarity = data.rarity;
        this.spriteFrame = data.spriteFrame;
        this.targetCount = data.targetCount;
        this.type = data.type;
        this.usageType = data.usageType;
        this.effects = (data.effects || []).map((effect) => new ProtocolEffectEnt(effect));
    }

    get richDescription(): string {
        if (!this.description) return '';

        const sortedEffects = [...this.effects].sort((a, b) => a.id - b.id);

        return this.description.replace(/\{(value|duration)(\d*)\}/gi, (match, field: string, indexStr: string) => {
            const index = indexStr ? parseInt(indexStr, 10) - 1 : 0;
            const effect = sortedEffects[index];
            if (!effect) return match;

            const rawVal = field.toLowerCase() === 'duration' ? effect.duration : effect.value;
            if (rawVal === null || rawVal === undefined) return match;

            const color = effect.intentType ? INTENT_COLORS[effect.intentType] : null;
            return color ? `<color=${color}><b>${rawVal}</b></color>` : `<b>${rawVal}</b>`;
        });
    }
}