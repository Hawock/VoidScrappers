
import { BaseApiService } from "db://assets/shared/infra/api/base-api.service";
import { GuestLoginRequestDto } from "./dto/auth.dto";

export class AuthApiService extends BaseApiService {
    public guestLogin(dto: GuestLoginRequestDto) {
        return this.api.request.post('/auth/guest', dto)
    }
}


