// assets/api/dto/auth.dto.ts

export interface GuestLoginRequestDto {
    deviceId: string;
    nickname?: string;
}

export interface AuthDto {
    sub: string;
    deviceId: string;
    nickname: string;
}

export interface AuthResponseDto {
    access_token: string;
    player: AuthDto;
}