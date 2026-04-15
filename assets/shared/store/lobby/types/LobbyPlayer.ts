export interface ILobbyPlayer {
    id: string;
    nickname: string;
    partyId: string;
    avatar: string;
    vanguardId: string;
    vanguardKey: string;
    isReady: boolean;
    status: string; // "online" | "disconnected" | "in_raid"
    isLeader: boolean;
}