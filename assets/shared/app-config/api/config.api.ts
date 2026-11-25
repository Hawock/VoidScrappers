import { BaseApiService } from "db://assets/shared/infra/api";

export class ConfigApiService extends BaseApiService {
    public async getVersion() {
        return this.api.request.get("/config/version");
    }

    public async getConfig() {
        return this.api.request.get("/config");
    }
}