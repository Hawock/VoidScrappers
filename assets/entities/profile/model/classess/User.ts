// assets/core/classes/User.ts

import { PlayerPayloadDto } from "../../api/dto/user.dto";

export class User {
    public id: string;
    public deviceId: string;
    public nickname: string;

    constructor(payload: PlayerPayloadDto) {
        this.id = payload.sub;
        this.deviceId = payload.deviceId;
        this.nickname = payload.nickname;
    }

    public getDisplayName(): string {
        return this.nickname;
    }
}