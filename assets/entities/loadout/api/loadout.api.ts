import { BaseApiService } from "db://assets/shared/infra/api/base-api.service";
import { LoadoutDto } from "./dto/loadout.dto";


export class LoadoutApiService extends BaseApiService {
    public getLoadout() {
        return this.api.request.get("/loadout");
    }
}