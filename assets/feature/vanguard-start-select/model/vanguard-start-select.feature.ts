import { Prefab } from "cc";
import { useDialogs } from "db://assets/shared/ui";

export function useVanguardStartSelect() {
    const { showDialog } = useDialogs();

    async function showVanguardSelectionDialog(itemPrefab: Prefab) {
        const selectedVanguard = await showDialog({
            isConfirm: true,
            header: "ВЫБОР АВАНГАРДА",
            component: itemPrefab,
            dialogOptions: {
                closable: false
            }
        })
        if(!selectedVanguard) return;

        console.log("Выбранный Авангард:", selectedVanguard);
        // Здесь ты можешь отправить выбранного авангарда на сервер или сохранить в стейт

    }

    return { showVanguardSelectionDialog };
}