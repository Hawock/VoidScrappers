import { PinaColada } from "db://assets/shared/infra/PinaColada";
import { ref, computed } from "db://assets/shared/infra/reactivity";

import { ExecutorRequest } from "db://assets/shared/infra/api";
import { InventoryApiService } from "../api/inventory.api";
import { IUserModule } from "../types/IUserModule";
import { UserModule } from "./classess/module";
import { ModuleBase } from "./classess/module-base";
import { useProfileStore } from "../../profile";


export const useInventoryStore = () => {
    return PinaColada.instance.useStore('inventory', () => {
        const profileStore = useProfileStore();
        const api = new InventoryApiService();
        const currentVanguard = computed(() => { 
            return profileStore.user.value?.activeVanguard }
        );
        // --- STATE ---
        const baseModules = ref<ModuleBase[]>([]);
        const userModules = ref<UserModule[]>([]);
        const isLoading = ref(false);

        const stashModules = computed(() => {
            console.log("Пересчитываем склад с учетом бесконечных модулей...");
            return userModules.value.filter(m => m.equippedToId === null);
        });

        const stashBlueprints = computed(() => {
            console.log("Пересчитываем склад с учетом бесконечных модулей...", baseModules.value);
            // Возвращаем все доступные игроку базовые чертежи
            return baseModules.value;
        });

        const equippedModules = (vanguardId: string) => computed(() => {
            console.log("ID авангарда",vanguardId)
            console.log("Доступные содули",userModules.value)
            return userModules.value.filter(m => m.equippedToId === vanguardId);
        });


        function setModuleList(modules: IUserModule[]) {
            userModules.value = modules.map(m => new UserModule(m));
        }

        function updateModuleInList(moduleId: string, module: IUserModule) {
            const index = userModules.value.findIndex(m => m.id === moduleId);
            if (index !== -1) userModules.value[index] = new UserModule(module);
        }

        // --- ACTIONS ---

        // Загрузка всех модулей пользователя из БД
        async function getModules() {
            console.log("Вычисляем текущего вангарда...", profileStore.user.value?.activeVanguard.vanguard.name);
            const res = await ExecutorRequest.exec(() => api.getInventory(), {
                loading: isLoading
            });
            if (!res) return false
            setModuleList(res);
            return true;
        }

        async function getBluePrints() {
            const res = await ExecutorRequest.exec(() => api.getBlueprints(), {
                loading: isLoading
            });
            if (!res) return false
            baseModules.value = res;
            return true;
        }

        /**
         * Экипировка модуля в слот
         * @param moduleId UUID модуля
         * @param vanguardId ID авангарда (на кого надеваем)
         * @param slotId ID слота (WEAPON_1, CORE и т.д.)
         */
        async function equipModule(moduleId: string, vanguardId: string, slotId: string) {
            const res = await ExecutorRequest.exec(() => api.equip(moduleId, vanguardId, slotId), {
                loading: isLoading
            });
            if(!res) return false
            updateModuleInList(moduleId, res);
            return true;
        }

        async function unequipModule(moduleId: string) {
            const res = await ExecutorRequest.exec(() => api.unequip(moduleId), {
                loading: isLoading
            });

            if (res) {
                // Обновляем модуль в списке. Теперь его equippedToId === null
                updateModuleInList(moduleId, res);
                return true;
            }
            return false;
        }

        return {
            userModules,
            isLoading,
            getModules,
            getBluePrints,
            equipModule,
            stashModules,
            equippedModules,
            stashBlueprints,
            unequipModule
        };
    });
};