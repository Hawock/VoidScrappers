export interface IRaidState {
    phase: 'LOBBY' | 'RAID' | 'COMBAT' | 'EVENT';
    currentRoomId: string;
    sessionId: string;
    seed: string;
}