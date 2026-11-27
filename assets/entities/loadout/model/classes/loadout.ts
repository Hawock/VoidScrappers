import { LoadoutDto } from "../../api/dto/loadout.dto";

export class Loadout {
  public readonly id: string;
  public readonly userId: string;
  public readonly vanguardId: string;
  public readonly vanguard: LoadoutDto['vanguard'];
  public readonly equippedModules: LoadoutDto['equippedModules'];

  constructor(dto: LoadoutDto) {
    this.id = dto.id;
    this.userId = dto.userId;
    this.vanguardId = dto.vanguardId;
    this.vanguard = dto.vanguard;
    this.equippedModules = dto.equippedModules ?? [];
  }

  public get vanguardName(): string {
    return this.vanguard?.name ?? '';
  }

  public get slots() {
    return [...(this.vanguard?.vanguardSlots ?? [])].sort(
      (a, b) => a.displayOrder - b.displayOrder,
    );
  }

  public getModuleForSlot(vanguardSlotId: string) {
    return (
      this.equippedModules.find((item) => item.vanguardSlotId === vanguardSlotId) ?? null
    );
  }
}