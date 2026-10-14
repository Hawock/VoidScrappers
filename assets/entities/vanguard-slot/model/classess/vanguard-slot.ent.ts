import { VanguardSlotDto } from "../dto/vanguard-slot.dto";

export class VanguardSLotEnt { 
    code: string 
    id: string 
    name: string 

    constructor(data: VanguardSlotDto) {
        this.code = data.code;
        this.id = data.id;
        this.name = data.name;
    }
}