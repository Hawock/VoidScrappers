// assets/scripts/stores/useLobbyStore.ts
import { PinaColada } from "db://assets/shared/infra/PinaColada";
import { ref } from "db://assets/shared/infra/reactivity";
import { ColyseusManager } from "db://assets/app/ColyseusManager";

export const useLobbyStore = () => {
    return PinaColada.instance.useStore('lobby', () => {
        
        // --- STATE ---
        const players = ref(new Map<string, any>());
        const selectedRaid = ref<any>(null);

        // --- ACTIONS ---
        
        // Обновить или добавить игрока
        function updatePlayer(sessionId: string, data: any) {
            // Чтобы триггернуть реактивность в ref с Map, 
            // иногда нужно пересоздать ссылку или убедиться, что твой ref это ловит
            players.value.set(sessionId, data);
            // Если UI не обновляется сам, раскомментируй строку ниже:
            // players.value = new Map(players.value); 
        }

        function removePlayer(sessionId: string) {
            players.value.delete(sessionId);
        }

        function setRaid(raidData: any) {
            selectedRaid.value = raidData;
            console.log(`✅ [LobbyStore] Рейд выбран: ${raidData.name}`);
        }

        // Геттер для проверки готовности всех (авто-старт)
        function checkAutoStart() {
            if (!selectedRaid.value) return;

            const allPlayers = Array.from(players.value.values());
            // Здесь можно добавить проверку на лидерство, 
            // но пока проверим просто готовность всех присутствующих
            const isEveryoneReady = allPlayers.every(p => p.isReady);

            if (isEveryoneReady && allPlayers.length > 0) {
                console.log("🚀 Все готовы! Отправляем команду на взлет...");
                ColyseusManager.instance.sendStartRaid(selectedRaid.value.id);
            }
        }

        return {
            players,
            selectedRaid,
            updatePlayer,
            removePlayer,
            setRaid,
            checkAutoStart
        };
    });
};