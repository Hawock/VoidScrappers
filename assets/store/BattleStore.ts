import { Enemy, Player } from "../core";
import { Protocol } from "../core/classes/Protocol";
import { IBattleStatePacket } from "../core/interfaces/battle/IBattleStatePacket";
import { PinaColada } from "../infra/PinaColada";
import { ref } from "../infra/reactivity";

export enum BATTLE_PHASE {
    START_BATTLE = 'start_battle', // Анимации появления, загрузка
    START_TURN = 'start_turn',     // Начисление энергии, эффекты начала хода
    PLAYERS_ACT = 'players_act',   // Игрок может играть карты
    ENEMY_TURN = 'enemy_turn',     // Ходят враги
    END_BATTLE = 'end_battle'      // Победа/Поражение
}

// BattleStore.ts
export const useBattleStore = () => {
    return PinaColada.instance.useStore('battle', () => {
        // --- STATE ---
        const turn = ref<number>(1);
        const players = ref<Player[]>([]);
        const enemies = ref<Enemy[]>([]);
        
        // Зоны протоколов
        const hand = ref<Protocol[]>([]);      
        const deck = ref<Protocol[]>([]);      
        const discard = ref<Protocol[]>([]);   
        const exhausted = ref<Protocol[]>([]); 

        const isDataReady = ref<boolean>(false); 
        const turnEndedPlayers = ref<Player[]>([]);

        // --- MUTATIONS ---
        const setBattleState = (packet: IBattleStatePacket) => {
            // Мапим игроков и врагов
            players.value = packet.players.map(p => {
                const player = new Player(p);
                player.prepareForBattle();
                return player;
            });
            enemies.value = packet.enemies.map(e => new Enemy(e));

            // ⚠️ ВАЖНО: Раскладываем карты по зонам из пакета
            hand.value = packet.initialHand || [];
            deck.value = packet.initialDeck || []; // Добавили колоду
            discard.value = [];
            exhausted.value = [];

            isDataReady.value = true;
            console.log("✅ Mutation: Данные боя и колод записаны.");
        };

        function toggleEndTurn(player: Player) {
            if (turnEndedPlayers.value.find(p => p.uid === player.uid))
                turnEndedPlayers.value = turnEndedPlayers.value.filter(p => p.uid !== player.uid);
            else
                turnEndedPlayers.value.push(player);
        }

        // --- ACTIONS ---
 
        return {
            turn, 
            players, 
            enemies, 
            hand,      
            deck,      
            discard,   
            exhausted, 
            isDataReady, 
            turnEndedPlayers,
            toggleEndTurn,
            setBattleState
        };
    });
};