import { ROOM_TYPE } from "./config/room-type.enum";

export interface IMapNode {
    id: string;
    type: ROOM_TYPE;
    step: number;
    encounterId: string;
    nextRooms: string[];
}