import { RaidItemDto } from "../../api/dto/raid-item.dto";

export class RaidItem {
    id: number = 0;
    name: string = '';
    difficulty: string = '';
    iconImage: string = '';

    constructor(raidDto: RaidItemDto) {
        this.id = raidDto.id;
        this.name = raidDto.name;
        this.difficulty = raidDto.difficulty;
        this.iconImage = raidDto.iconImage;
    }
}