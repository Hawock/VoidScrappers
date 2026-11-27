import { PinaColada } from "db://assets/shared/infra/PinaColada";
import { ref } from "db://assets/shared/infra/reactivity";
import { ExecutorRequest } from "db://assets/shared/infra/api";
import { LoadoutApiService } from "../api/loadout.api";
import { Loadout } from "./classes/loadout";
import { LoadoutDto } from "../api/dto/loadout.dto";


export const useLoadoutStore = () => {
    return PinaColada.instance.useStore('loadout', () => {
        const loadoutApi = new LoadoutApiService();

        const loadout = ref<Loadout | null>(null);
        const isLoading = ref(false);

        function setLoadout(data: LoadoutDto | null) {
            loadout.value = data ? new Loadout(data) : null;
            return loadout.value;
        }

        function clearLoadout() {
            loadout.value = null;
        }

        async function fetchLoadout() {
            const res = await ExecutorRequest.exec(() => loadoutApi.getLoadout(), {
                loading: isLoading,
            });
            if (!res) {
                loadout.value = null;
                return null;
            }
            return setLoadout(res);
        }

        return {
            loadout,
            isLoading,
            setLoadout,
            clearLoadout,
            fetchLoadout,
        };
    });
};