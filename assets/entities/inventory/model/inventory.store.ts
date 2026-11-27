import { PinaColada } from "db://assets/shared/infra/PinaColada";
import { ref, computed } from "db://assets/shared/infra/reactivity";
import { ExecutorRequest } from "db://assets/shared/infra/api";
import { InventoryApiService } from "../api/inventory.api";
import { SaveInventoryModulePayload } from "../api/dto/SaveInventoryModulePayload";
import { UserModule } from "../../module/model/classess/module";
import { RARITY } from "../../module/config/module.enum";
import { ProtocolEnt } from "../../protocols/model/classess/protocol.ent";
import { useLoadoutStore } from "../../loadout/model/loadout.store";
import { ModuleDto } from "../../module/dto/module.dto";
import { UserModuleDto } from "../../module/dto/user-module.dto";

export const useInventoryStore = () => {
    return PinaColada.instance.useStore('inventory', () => {
        const loadoutStore = useLoadoutStore();
        const api = new InventoryApiService();

        const currentVanguard = computed(() => loadoutStore.loadout.value);

        // --- STATE ---
        const baseModules = ref<UserModule[]>([]);
        const userModules = ref<UserModule[]>([]);
        const isLoading = ref(false);
        const selectedModuleId = ref<string | null>(null);

        const stashModules = computed(() => {
            return userModules.value.filter(m => m.equippedToId === null);
        });

        const blueprints = computed(() => baseModules.value);

        const fullInventoryList = computed(() => {
            return [...blueprints.value, ...stashModules.value];
        });

        const equippedModules = (vanguardId: string) => computed(() => {
            return userModules.value.filter(m => m.equippedToId === vanguardId);
        });

        const selectedModule = computed(() => {
            if (!selectedModuleId.value) return null;
            return userModules.value.find(m => m.id === selectedModuleId.value) ||
                baseModules.value.find(m => m.id === selectedModuleId.value || m.moduleId === selectedModuleId.value);
        });

        function selectModule(id: string | null) {
            selectedModuleId.value = selectedModuleId.value === id ? null : id;
        }

        const canAddStarter = computed(() => {
            const limits: Record<string, number> = {};
            const current: Record<string, number> = {};
            const slots = currentVanguard.value?.slots;

            if (!slots || slots.length === 0) {
                return {};
            }

            slots.forEach(slot => {
                const type = slot.slot?.code;
                if (type) {
                    limits[type] = (limits[type] || 0) + 1;
                }
            });

            userModules.value.forEach(item => {
                if (item.rarity === RARITY.STARTER) {
                    const type = item.slotType;
                    current[type] = (current[type] || 0) + 1;
                }
            });

            const result: Record<string, boolean> = {};
            Object.keys(limits).forEach(type => {
                result[type] = (current[type] || 0) < limits[type];
            });

            return result;
        });

        function setBluePrints(modules: ModuleDto[]) {
            baseModules.value = modules.map(m => new UserModule(m));
        }

        function setModuleList(modules: UserModuleDto[]) {
            userModules.value = modules.map(m => new UserModule(m));
        }

        // --- ACTIONS ---
        async function getModules() {
            console.log("Вычисляем текущего вангарда...", currentVanguard.value?.vanguardName);
            const res = await ExecutorRequest.exec(() => api.getInventory(), {
                loading: isLoading
            });
            if (!res) return false;
            setModuleList(res);
            return true;
        }

        async function getBluePrints() {
            const res = await ExecutorRequest.exec(() => api.getBlueprints(), {
                loading: isLoading
            });
            if (!res) return false;
            setBluePrints(res);
            return true;
        }

        async function equipModule(moduleId: string, vanguardId: string, slotId: string) {
            const occupant = userModules.value.find(m => m.vanguardSlotId === slotId);

            if (occupant && occupant.id !== moduleId) {
                await unequipModule(occupant.id);
            }

            let index = userModules.value.findIndex(m => m.id === moduleId);
            let moduleInstance: UserModule;

            if (index === -1) {
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

            moduleInstance.equippedToId = vanguardId;
            moduleInstance.vanguardSlotId = slotId;

            userModules.value = [...userModules.value];
            userModules.events.emit('changed', userModules.value);
        }

        async function unequipModule(moduleId: string) {
            const index = userModules.value.findIndex(m => m.id === moduleId);
            if (index === -1) return;

            const [moduleInstance] = userModules.value.splice(index, 1);
            moduleInstance.vanguardSlotId = null;
            moduleInstance.equippedToId = null;
            userModules.value.push(moduleInstance);

            userModules.value = [...userModules.value];
            userModules.events.emit('changed', userModules.value);
        }

        const totalEquippedProtocolsCount = computed(() => {
            const vanguardId = currentVanguard.value?.id;
            if (!vanguardId) return 0;

            return userModules.value
                .filter(m => m.equippedToId === vanguardId)
                .reduce((sum, m) => sum + (m.selectedProtocols?.length || 0), 0);
        });

        function getMaxProtocols(mod: UserModule | null): number {
            if (!mod) return 0;
            return mod.module.slot?.maxProtocols ?? 3;
        }

        function addProtocolToModule(userModuleId: string, protocol: ProtocolEnt) {
            const mod = userModules.value.find(m => m.id === userModuleId);
            if (!mod || mod.isBlueprint) return false;
            if ((mod.selectedProtocols?.length || 0) >= getMaxProtocols(mod)) return false;

            const prev = mod.selectedProtocols || [];
            mod.selectedProtocols = [...prev, protocol];

            userModules.value = [...userModules.value];
            userModules.events.emit('changed', userModules.value);
            return true;
        }

        function removeProtocolFromModule(userModuleId: string, protocolId: string) {
            const mod = userModules.value.find(m => m.id === userModuleId);
            if (!mod || mod.isBlueprint) return false;

            const current = mod.selectedProtocols || [];
            const index = current.findIndex(p => p.id === protocolId);
            if (index === -1) return false;

            const next = [...current];
            next.splice(index, 1);
            mod.selectedProtocols = next;

            userModules.value = [...userModules.value];
            userModules.events.emit('changed', userModules.value);
            return true;
        }

        async function commitInventory(): Promise<boolean> {
            const payload: SaveInventoryModulePayload[] = userModules.value.map((mod) => ({
                id: mod.id.startsWith('temp_') ? null : mod.id,
                moduleId: mod.moduleId,
                equippedToId: mod.equippedToId ?? null,
                vanguardSlotId: mod.vanguardSlotId ?? null,
                protocolIds: (mod.selectedProtocols || []).map((p) => p.id),
            }));

            const res = await ExecutorRequest.exec(
                () => api.saveInventory(payload),
                { loading: isLoading },
            );

            if (!res) return false;

            setModuleList(res);
            userModules.events.emit('changed', userModules.value);
            await loadoutStore.fetchLoadout();
            return true;
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
            selectModule,
            totalEquippedProtocolsCount,
            getMaxProtocols,
            addProtocolToModule,
            removeProtocolFromModule,
            commitInventory
        };
    });
};