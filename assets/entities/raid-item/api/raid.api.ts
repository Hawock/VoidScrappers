import { BaseApiService } from "db://assets/shared/infra/api";

class RaidApiService extends BaseApiService {
    public getRaidList () {
        return this.api.request.get('/game/raids');
    }

    public selectRaid (id: number) {
        return this.api.request.get(`/game/raids/${id}`);
    }
}

export const RaidApi = new RaidApiService();