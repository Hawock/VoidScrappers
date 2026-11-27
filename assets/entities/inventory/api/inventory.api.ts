import { BaseApiService } from "db://assets/shared/infra/api";
import { SaveInventoryModulePayload } from "./dto/SaveInventoryModulePayload";

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

    public saveInventory(modules: SaveInventoryModulePayload[]) {
        return this.api.request.post("/inventory/save", { modules });
    }

}