import { PinaColada } from "db://assets/shared/infra/PinaColada";
import { ref } from "db://assets/shared/infra/reactivity";
import { User } from "./classess/User";
import { ExecutorRequest } from "db://assets/shared/infra/api";
import { AuthApi } from "../api/auth.api";
import { GuestLoginRequestDto, PlayerPayloadDto } from "../api/dto/user.dto";


export const useProfileStore = () => {
    return PinaColada.instance.useStore('profile', () => {
        // --- STATE ---
        const currentUser = ref<User | null>(null);
        const token = ref<string>(''); 
        const isAuthorized = ref<boolean>(false);
        const isLoading = ref(false)

        // --- ACTIONS ---
        function setProfile (data: {user: PlayerPayloadDto, access_token: string}) {
            currentUser.value = new User(data.user);
            token.value = data.access_token;
            isAuthorized.value = true;
            console.log(`✅ [ProfileStore] Успешный вход: ${currentUser.value.getDisplayName()}`);
        };

        function logout () {
            currentUser.value = null;
            token.value = '';
            isAuthorized.value = false;
            console.log(`🚪 [ProfileStore] Выполнен выход`);
        };

        async function guestLogin (dto: GuestLoginRequestDto) {
            console.log("РОШЕЛ ЗАПРСО!")
            const res = await ExecutorRequest.exec(() => AuthApi.guestLogin(dto), {
                loading: isLoading, success_message: "Выполнен вход гостя"
            });
            if (!res) return false
            console.log("РОШЕЛ ЗАПРСО! РЕЗУЛЬТАТ: ", res)
            setProfile(res);
            return true
        }

        return {
            currentUser,
            token,
            isAuthorized,
            setProfile,
            logout,
            guestLogin
        };
    });
};