import { BaseApiService } from "db://assets/shared/infra/api";

export class InventoryApiService extends BaseApiService {
    public async getInventory() {
        return this.api.request.get("/inventory");
    }

    public equip(moduleId: string, vanguardId: string, slotId: string) {
        console.log("Equip module", moduleId, "to vanguard", vanguardId, "in slot", slotId);
    }

    public unequip(moduleId: string) {
        console.log("Unequip module", moduleId);
    }

    public getBlueprints() {
        return this.api.request.get("/inventory/blueprints");
    }
}