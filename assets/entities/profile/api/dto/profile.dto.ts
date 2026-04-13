export interface ProfileDto {
    id: string;
    nickname: string;
    deviceId: string;
    needsInitialSelection: boolean;
    activeVanguard: string | null;
}