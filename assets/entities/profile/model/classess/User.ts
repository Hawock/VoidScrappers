// assets/core/classes/User.ts

import { AuthDto } from "../../api/dto/auth.dto";
import { ProfileDto } from "../../api/dto/profile.dto";

export class User {
    public id: string;
    public deviceId: string;
    public nickname: string;
    public needsInitialSelection: boolean;
    public activeVanguard: any | null;


    constructor(payload: ProfileDto) {
        this.id = payload.id;
        this.deviceId = payload.deviceId;
        this.nickname = payload.nickname;
        this.needsInitialSelection = payload.needsInitialSelection;
        this.activeVanguard = payload.activeVanguard;
    }

    public getDisplayName(): string {
        return this.nickname;
    }
}