import { PinaColada } from "db://assets/shared/infra/PinaColada";
import { ref } from "db://assets/shared/infra/reactivity";
import { User } from "./classess/User";
import { ExecutorRequest } from "db://assets/shared/infra/api";
import { GuestLoginRequestDto, AuthDto } from "../api/dto/auth.dto";
import { AuthApiService } from "../api/auth.api";

import { ColyseusManager } from "db://assets/app/ColyseusManager";
import { ProfileDto } from "../api/dto/profile.dto";
import { sys } from "cc";
import { ProfileApiService } from "../api/profile.api";

export const useProfileStore = () => {
    return PinaColada.instance.useStore('profile', () => {
        const authApi = new AuthApiService();
        const  profileApi  = new ProfileApiService();
        // --- STATE ---
        const user = ref<User | null>(null);
        const token = ref<string>(''); 
        const isAuthorized = ref<boolean>(false);
        const isLoading = ref(false);
        
        // --- НОВЫЙ СТЕЙТ ПРОФИЛЯ ---
        const needsInitialSelection = ref<boolean>(false);
        const activeVanguard = ref<any>(null); // Тут позже можно типизировать

        // --- ACTIONS ---
        function setAuth (data: { access_token: string}) {
            token.value = data.access_token;
            isAuthorized.value = true;
            sys.localStorage.setItem('token', token.value);
        };

        function setProfile(data: ProfileDto){
            user.value = new User(data);
            return user.value;
        }

        function setUserVanguard(profile: ProfileDto) {
            if (user.value) {
                user.value.activeVanguard = profile.activeVanguard;
            }
        }

        function logout () {
            user.value = null;
            token.value = '';
            isAuthorized.value = false;
            needsInitialSelection.value = false;
            activeVanguard.value = null;
            sys.localStorage.removeItem('token');
        };

        async function getStartVanguards() {
            const res = await ExecutorRequest.exec(() => profileApi.getStartVanguard(), {
                loading: isLoading
            });
            if(!res) return false
            return res;
        }

        async function getFullProfile() {
            const res = await ExecutorRequest.exec(() => profileApi.getProfile(), {
                loading: isLoading
            });
            if(!res) return false
            return setProfile(res)
        }

        async function setStartVanguard(vanguardId: string) {
            const res = await ExecutorRequest.exec(() => profileApi.setStartVanguard(vanguardId), {
                loading: isLoading
            });
            if(!res) return false
            setUserVanguard(res)
            return true;
        }

        // --- ОБНОВЛЕННЫЙ ЛОГИН ---
        async function guestLogin (dto: GuestLoginRequestDto) {
            // 1. Авторизуемся
            const res = await ExecutorRequest.exec(() => authApi.guestLogin(dto), {
                loading: isLoading, success_message: "Выполнен вход гостя"
            });
            if (!res) return false;
            setAuth(res);         
            return true; 
        }

        return {
            user,
            token,
            isAuthorized,
            needsInitialSelection,
            activeVanguard,
            logout,
            getFullProfile,
            guestLogin,
            setStartVanguard,
            getStartVanguards
        };
    });
};