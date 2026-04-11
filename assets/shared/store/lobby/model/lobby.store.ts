import { PinaColada } from "db://assets/shared/infra/PinaColada";
import { ref } from "db://assets/shared/infra/reactivity";
import { ColyseusManager } from "db://assets/app/ColyseusManager";
import { ILobbyPlayer } from "../types/LobbyPlayer";


export const useLobbyStore = () => {
    return PinaColada.instance.useStore('lobby', () => {
        
        // --- STATE ---
        const players = ref(new Map<string, ILobbyPlayer>());
        const selectedRaid = ref<any>(null);

        // --- HELPERS ---

        function getMyPlayer(): ILobbyPlayer | undefined {
            const myId = ColyseusManager.instance.sessionId;
            return players.value.get(myId);
        }

        /**
         * Проверка: все ли участники группы готовы?
         * Вызывается автоматически при любом изменении стейта.
         */
        function checkAutoStart() {
            const me = getMyPlayer();
            
            // 1. Командовать стартом может только лидер
            if (!me || !me.isLeader) return;

            // 2. Должен быть выбран конкретный рейд (локация)
            if (!selectedRaid.value || !selectedRaid.value.id) return;

            // 3. Собираем всех членов нашей группы
            const myParty = Array.from(players.value.values())
                .filter(p => p.partyId === me.partyId);

            // 4. Проверяем готовность (все, кроме лидера, должны нажать "Готов")
            // Лидер по умолчанию готов, если он инициировал проверку
            const everyoneReady = myParty.every(p => p.id === me.id || p.isReady);

            if (everyoneReady && myParty.length > 0) {
                console.log("🚀 [LobbyStore] Все условия выполнены. Запуск рейда...");
                ColyseusManager.instance.sendStartRaid(selectedRaid.value.id);
            }
        }

        // --- ACTIONS ---
        
        function updatePlayer(sessionId: string, data: ILobbyPlayer) {
            players.value.set(sessionId, data);
            players.value = new Map(players.value); 

            // --- ЛОГ ДЛЯ ТЕСТА ---
            const me = getMyPlayer();
            if (me && me.partyId !== "") {
                // Находим всех, у кого такой же partyId
                const myGroup = Array.from(players.value.values())
                    .filter(p => p.partyId === me.partyId)
                    .map(p => `${p.nickname}${p.isLeader ? ' (L)' : ''}`);

                console.log(`👥 [LobbyStore] Состав твоего звена [ID: ${me.partyId}]:`, myGroup.join(', '));
            } else if (me && me.partyId === "") {
                console.log(`👤 [LobbyStore] Ты сейчас соло-боец.`);
            }
            // ----------------------

            checkAutoStart();
        }

        function removePlayer(sessionId: string) {
            if (players.value.delete(sessionId)) {
                players.value = new Map(players.value);
            }
        }

        /**
         * Тот самый метод для выбора рейда
         */
        function setRaid(raidData: any) {
            selectedRaid.value = raidData;
            console.log(`✅ [LobbyStore] Рейд выбран: ${raidData.name}`);
            
            // Если лидер выбрал рейд, возможно все уже готовы и можно лететь
            checkAutoStart();
        }

        return {
            players,
            selectedRaid,
            getMyPlayer,
            updatePlayer,
            removePlayer,
            setRaid, // Теперь он на месте!
            checkAutoStart
        };
    });
};