export interface IPlayer {
    sessionId: string;
    userId: string;
    name: string;
    isLeader: boolean;
    vote: string;
    currentHp: number;
    maxHp: number;
    vanguardSnapshot: string;
}