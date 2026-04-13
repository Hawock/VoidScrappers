import { BaseApiService } from "db://assets/shared/infra/api/base-api.service"

export class ProfileApiService extends BaseApiService {
    public getProfile() {
        return this.api.request.get('/profile/me')
    }

    public setStartVanguard(vanguardId: string) {
        return this.api.request.post('/profile/set-start-vanguard', { vanguardId })
    }

    public getStartVanguard() {
        return this.api.request.get('/vanguards/starters')
    }
}


