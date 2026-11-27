export interface SaveInventoryModulePayload {
    id: string | null;
    moduleId: string;
    equippedToId: string | null;
    vanguardSlotId: string | null;
    protocolIds: string[];
}