import { sys } from "cc";
import { Whisk } from "./whisk";
import { useProfileStore } from "../../../entities/profile";
import { SERVER_STATUS } from "./server-statuses.enum";
import { NotificationBus } from "../notifications/useNotifications";


export default class Api {
    static instance: Api;
    public request: Whisk;
    
    baseURL: string = "http://localhost:3000"; 
    isRefreshing: boolean = false;
    refreshSubscribers: ((error: boolean) => void)[] = [];

    constructor() {
        this.request = new Whisk({ baseURL: this.baseURL });
        this.setInterceptors();
    }

    public static createApi(): Api {
        if (!Api.instance) Api.instance = new Api();
        return Api.instance;
    }

    setInterceptors() {
        // Подкидываем JWT токен перед каждым запросом
        this.request.interceptors.request.use((config: Whisk) => {
            const profileStore = useProfileStore();
            if (profileStore.token.value) {
                config.addHeader('Authorization', `Bearer ${profileStore.token.value}`);
            }
        });

        this.request.interceptors.response.use(
            (response: any) => response,
            async (error: any) => {
                // Если сервер вернул ошибку
                const errorData = error.response || error;
                
                if (errorData && errorData.status) {
                    switch (errorData.status) {
                        case SERVER_STATUS.VALIDATE_ERROR:
                            const errors = errorData.data?.data?.errors || {};
                            for (const key in errors) {
                                NotificationBus.emit('add_toast', {
                                    severity: 'error',
                                    summary: 'Ошибка',
                                    detail: errors[key].message
                                });
                            }
                            break;

                        case SERVER_STATUS.ACCESS_DENIED:
                        case SERVER_STATUS.UNAUTHORIZED:
                            // Если словили 401, чистим стор (упрощенная логика без рефреша для начала)
                            this.clearAuthData();
                            NotificationBus.emit('add_toast', {
                                severity: 'error', summary: 'Ошибка', detail: "Требуется авторизация"
                            });
                            break;

                        case SERVER_STATUS.SERVER_ERROR:
                            NotificationBus.emit('add_toast', {
                                severity: 'error', summary: 'Ошибка', detail: "Ошибка сервера"
                            });
                            break;
                    }
                }
                return errorData; // Возвращаем ошибку, чтобы ExecutorRequest её поймал
            }
        );
    }

    private clearAuthData() {
        const profileStore = useProfileStore();
        profileStore.logout();
        sys.localStorage.removeItem("deviceId");
    }
}