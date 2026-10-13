import { VanguardDto } from "../../dto/vangard.dto"

export class VanguardEnt {
    baseHp: number
    energyPerTurn: number
    id: string
    name: string
    spriteUrl: string

    constructor(data: VanguardDto) {
        this.baseHp = data.baseHp;
        this.energyPerTurn = data.energyPerTurn;
        this.id = data.id;
        this.name = data.name;
        this.spriteUrl = data.spriteUrl;
    }
}