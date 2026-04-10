import { PinaColada } from "db://assets/shared/infra/PinaColada"
import { ref } from "db://assets/shared/infra/reactivity"
import { RaidItem } from "./classess/raidI-tem";
import { RaidItemDto } from "../api/dto/raid-item.dto";
import { ExecutorRequest } from "db://assets/shared/infra/api";
import { RaidApiService } from "../api/raid.api";


export const useRaidStore = () => {
    return PinaColada.instance.useStore('raids', () => {
        const raidApi = new RaidApiService();
        const isLoading = ref(false);
        const isRaidLoaded = ref(false);
        const raids = ref<RaidItem[]>([]);

        function setRaidList (list: RaidItemDto[]) {
            raids.value = list.map(raid => new RaidItem(raid));
        }

        async function getRaidList () {
            if(isRaidLoaded.value) return;
            const res =  await ExecutorRequest.exec(() => raidApi.getRaidList(), {
                loading: isLoading, 
            })
            if(!res) return false;
            setRaidList(res);
            isRaidLoaded.value = true;
        }

        return { raids, isLoading, setRaidList, getRaidList };
    })
}