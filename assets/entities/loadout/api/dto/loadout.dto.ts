import { ModuleDto } from "../../../module/dto/module.dto";
import { ProtocolDto } from "../../../protocols/dto/protocol.dto";
import { VanguardSlotDto } from "../../../vanguard-slot/model/dto/vanguard-slot.dto";
import { VanguardDto } from "../../../vanguard/dto/vangard.dto";

export interface LoadoutDto {
  id: string;
  userId: string;
  vanguardId: string;
  vanguard: VanguardDto & {
    vanguardSlots?: Array<{
      id: string;
      displayOrder: number;
      slot: VanguardSlotDto;
    }>;
  };
  equippedModules: Array<{
    id: string;
    moduleId: string;
    vanguardSlotId: string | null;
    module: ModuleDto;
    selectedProtocols?: Array<{
      order: number;
      protocol: ProtocolDto;
    }>;
  }>;
}