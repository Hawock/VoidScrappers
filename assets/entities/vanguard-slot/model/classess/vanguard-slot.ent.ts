import { VanguardSlotDto } from "../dto/vanguard-slot.dto";

export class VanguardSLotEnt { 
    code: string 
    id: string 
    name: string 
    maxProtocols: number

    constructor(data: VanguardSlotDto) {
        this.code = data.code;
        this.id = data.id;
        this.name = data.name;
        this.maxProtocols = data.maxProtocols
    }
}