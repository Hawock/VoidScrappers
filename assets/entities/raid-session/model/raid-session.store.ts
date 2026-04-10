// Используем 'import type'! Это критично для Cocos 3.8

import { PinaColada } from 'db://assets/shared/infra/PinaColada';
import { IMapNode } from '../IMapNode';
import { IPlayer } from '../types/IPlayer';
import { ref } from 'db://assets/shared/infra/reactivity';
import { Room } from 'db://colyseus-sdk/colyseus';

export const useRaidSessionStore = () => {
    return PinaColada.instance.useStore('raid-session', () => {
        
        const session = ref({
            phase: 'LOBBY',
            currentRoomId: '',
            nodes: [] as IMapNode[],
            players: [] as IPlayer[],
            sessionId: '',
            seed: ''
        });

        // Здесь Room используется только как тип
        let _room: Room | null = null; 

        return {
            session,

            setRoom(room: Room) {
                _room = room;
                this.syncState(room.state);
                room.onStateChange((state) => this.syncState(state));
            },

            syncState(state: any) {
                session.value.phase = state.phase;
                session.value.currentRoomId = state.currentRoomId;
                session.value.sessionId = state.sessionId;
                session.value.seed = state.seed;

                session.value.nodes = Array.from(state.nodes.values()) as IMapNode[];
                session.value.players = Array.from(state.players.values()) as IPlayer[];
            },

            vote(nodeId: string) {
                if (_room) _room.send('VOTE_FOR_ROOM', { nodeId });
            }
        };
    });
};