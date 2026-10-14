import { PinaColada } from "db://assets/shared/infra/PinaColada";
import { ref, computed } from "db://assets/shared/infra/reactivity";

import { ExecutorRequest } from "db://assets/shared/infra/api";
import { InventoryApiService } from "../api/inventory.api";
import { IUserModule } from "../types/IUserModule";
import { UserModule } from "./classess/module";
import { useProfileStore } from "../../profile";
import { RARITY } from "../config/module.enum";
import { IModuleBase } from "../types/IModuleBase";


export const useInventoryStore = () => {
    return PinaColada.instance.useStore('inventory', () => {
        const profileStore = useProfileStore();
        const api = new InventoryApiService();
        const currentVanguard = computed(() => { 
            return profileStore.user.value?.activeVanguard }
        );
        // --- STATE ---
        const baseModules = ref<UserModule[]>([]);
        const userModules = ref<UserModule[]>([]);
        const isLoading = ref(false);
        const selectedModuleId = ref<string | null>(null);
       // 1. Модули, которые НЕ надеты (лежат в рюкзаке)
        const stashModules = computed(() => {
            return userModules.value.filter(m => m.equippedToId === null);
        });

        // 2. Чертежи (всегда доступны)
        const blueprints = computed(() => baseModules.value);

        // 3. ФИНАЛЬНЫЙ СПИСОК ДЛЯ ИНВЕНТАРЯ (Чертежи + Модули в рюкзаке)
        const fullInventoryList = computed(() => {
            console.log("[STORE] Собираем общий список инвентаря...");
            return [...blueprints.value, ...stashModules.value];
        });

        const equippedModules = (vanguardId: string) => computed(() => {
            console.log("ID авангарда",vanguardId)
            console.log("Доступные содули",userModules.value)
            return userModules.value.filter(m => m.equippedToId === vanguardId);
        });

        const selectedModule = computed(() => {
            if (!selectedModuleId.value) return null;
            // Ищем и в рюкзаке, и в чертежах
            return userModules.value.find(m => m.id === selectedModuleId.value) || 
                baseModules.value.find(m => m.id === selectedModuleId.value || m.moduleId === selectedModuleId.value);
        });

        function selectModule(id: string | null) {
            // Если пришел тот же ID, что уже выбран — сбрасываем в null
            if (selectedModuleId.value === id) {
                selectedModuleId.value = null;
            } else {
                selectedModuleId.value = id;
            }
        }

        const canAddStarter = computed(() => {
            const limits = {}; 
            const current = {}; 

            // ЗАЩИТА: Если данных о вангарде еще нет, возвращаем пустой объект
            if (!currentVanguard.value || !currentVanguard.value.slots) {
                return {}; 
            }

            // 1. Мапим лимиты по типу из текущего авангарда
            currentVanguard.value.slots.forEach(slot => {
                // Проверяем, что slot и type существуют, чтобы не упасть снова
                const type = slot.slot?.code || slot.type; 
                if (type) {
                    limits[type] = (limits[type] || 0) + 1;
                }
            });

            // 2. Считаем стартеры
            const allItems = userModules.value;
            allItems.forEach(item => {
                if (item.rarity === RARITY.STARTER) {
                    const type = item.slotType;
                    current[type] = (current[type] || 0) + 1;
                }
            });

            // 3. Формируем карту [type]: boolean
            const result = {};
            Object.keys(limits).forEach(type => {
                result[type] = (current[type] || 0) < limits[type];
            });

            return result; 
        });

        function setBluePrints(modules: IModuleBase[]) {
            baseModules.value = modules.map(m => new UserModule(m));
        }

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
            setBluePrints(res);
            return true;
        }

        /**
         * Экипировка модуля в слот
         * @param moduleId UUID модуля
         * @param vanguardId ID авангарда (на кого надеваем)
         * @param slotId ID слота (WEAPON_1, CORE и т.д.)
         */
        async function equipModule(moduleId: string, vanguardId: string, slotId: string) {
            console.log(`[STORE] Экипировка в слот: ${slotId}`);

            // 1. Проверяем, не занят ли слот. 
            // Если занят — вызываем наш существующий метод снятия.
            const occupant = userModules.value.find(m => m.vanguardSlotId === slotId);
            
            if (occupant && occupant.id !== moduleId) {
                console.log(`[STORE] Слот занят. Вытесняем модуль: ${occupant.id}`);
                // Вызываем unequip. Так как он async, лучше подождать, 
                // чтобы массив пересобрался до того, как мы начнем ставить новый.
                await unequipModule(occupant.id);
            }

            // 2. Ищем наш целевой модуль (или создаем из чертежа)
            let index = userModules.value.findIndex(m => m.id === moduleId);
            let moduleInstance: UserModule;

            if (index === -1) {
                // Логика чертежа
                const bp = baseModules.value.find(b => b.id === moduleId || b.moduleId === moduleId);
                if (!bp) return;

                moduleInstance = new UserModule({
                    ...bp,
                    id: "temp_" + Math.random(), 
                });
                userModules.value.push(moduleInstance);
            } else {
                moduleInstance = userModules.value[index];
            }

            // 3. Устанавливаем новые данные
            moduleInstance.equippedToId = vanguardId;
            moduleInstance.vanguardSlotId = slotId;

            // 4. Финальный пинок реактивности
            userModules.value = [...userModules.value];
            userModules.events.emit('changed', userModules.value);
        }

        async function unequipModule(moduleId: string) {
            // 1. Находим индекс предмета
            const index = userModules.value.findIndex(m => m.id === moduleId);
            if (index === -1) return;

            // 2. Достаем сам объект (удаляем его из массива)
            const [moduleInstance] = userModules.value.splice(index, 1);

            // 3. Обновляем его статус
            moduleInstance.vanguardSlotId = null;
            moduleInstance.equippedToId = null;

            // 4. Добавляем его В КОНЕЦ массива
            userModules.value.push(moduleInstance);

            // 5. Обновляем ссылку для срабатывания watch
            userModules.value = [...userModules.value];
            
            // Пинаем эмиттер
            userModules.events.emit('changed', userModules.value);

            console.log(`[STORE] Модуль ${moduleId} перемещен в конец списка рюкзака`);
        }

        return {
            userModules,
            isLoading,
            canAddStarter,
            blueprints,
            getModules,
            getBluePrints,
            equipModule,
            stashModules,
            equippedModules,
            fullInventoryList,
            unequipModule,
            selectedModuleId,
            selectedModule,
            selectModule
        };
    });
};