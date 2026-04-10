import { PinaColada } from "db://assets/shared/infra/PinaColada";
import { ref } from "db://assets/shared/infra/reactivity";
import { User } from "./classess/User";
import { ExecutorRequest } from "db://assets/shared/infra/api";
import { GuestLoginRequestDto, PlayerPayloadDto } from "../api/dto/user.dto";
import { AuthApiService } from "../api/auth.api";
import { ColyseusManager } from "db://assets/app/ColyseusManager";



export const useProfileStore = () => {
    return PinaColada.instance.useStore('profile', () => {
        const authApi = new AuthApiService();
        // --- STATE ---
        const user = ref<User | null>(null);
        const token = ref<string>(''); 
        const isAuthorized = ref<boolean>(false);
        const isLoading = ref(false)

        // --- ACTIONS ---
        function setProfile (data: {user: PlayerPayloadDto, access_token: string}) {
            user.value = new User(data.user);
            token.value = data.access_token;
            isAuthorized.value = true;
            console.log(`✅ [ProfileStore] Успешный вход: ${user.value.getDisplayName()}`);
        };

        function logout () {
            user.value = null;
            token.value = '';
            isAuthorized.value = false;
            console.log(`🚪 [ProfileStore] Выполнен выход`);
        };

        async function guestLogin (dto: GuestLoginRequestDto) {
            const res = await ExecutorRequest.exec(() => authApi.guestLogin(dto), {
                loading: isLoading, success_message: "Выполнен вход гостя"
            });
            if (!res) return false
            console.log("ПОШЕЛ ЗАПРСО! РЕЗУЛЬТАТ: ", res)
            setProfile(res);
            if (ColyseusManager.instance) {
                await ColyseusManager.instance.connectToLobby({
                    id: user.value.id,
                    nickname: user.value.nickname
                });
            }
            return true
        }

        return {
             user,
            token,
            isAuthorized,
            setProfile,
            logout,
            guestLogin
        };
    });
};