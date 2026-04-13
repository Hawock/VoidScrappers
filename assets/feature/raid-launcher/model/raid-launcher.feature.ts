// features/raid-launch/RaidLauncher.ts

import { director, Prefab } from "cc";
import { useDialogs } from "db://assets/shared/ui";

export function useRaidLauncher() {
    const {showDialog } = useDialogs();

    
     async function startRaidSelection(raidListPrefab: Prefab) {
        const selectedRaid = await showDialog({
            isConfirm: true,
            header: "ВЫБОР РЕЙДА",
            component: raidListPrefab,
            dialogOptions: {
                width: 900
            }
        });

        if (!selectedRaid) return;

        // --- НАЧИНАЕТСЯ ГРЯЗНАЯ РАБОТА ---

        // 2. Отправляем на сервер выбор (чтобы сервер зафиксировал начало рейда)
        // const success = await ExecutorRequest.exec(() => RaidApi.startRaid(selectedRaid.id), {
        //    loading: globalLoadingRef // можно показать глобальный лоадер
        // });
        
        // if (!success) return; 

        // 3. Сохраняем выбранный рейд в стейт (если нужно для сцены боя)
        // useBattleStore().currentRaid = selectedRaid;

        // 4. Переход на сцену карты/боя
        console.log("Загружаем карту рейда...");
        director.loadScene('MapScene'); 
    }

    return {
        startRaidSelection,
    }
}