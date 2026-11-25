import { PinaColada } from "db://assets/shared/infra/PinaColada";
import { ref, computed } from "db://assets/shared/infra/reactivity";
import { ExecutorRequest } from "db://assets/shared/infra/api";
import { DEFAULT_REQUIRED_PROTOCOLS, GameConfigSettings } from "../types/config.types";
import { ConfigCache } from "../classes/config-cache";
import { ConfigApiService } from "../api/config.api";


export const useConfigStore = () => {
    return PinaColada.instance.useStore("app-config", () => {
        const api = new ConfigApiService();

        const isLoading = ref(false);
        const version = ref<number>(0);
        const settings = ref<GameConfigSettings>({
            requiredEquippedProtocols: DEFAULT_REQUIRED_PROTOCOLS,
        });

        const requiredEquippedProtocols = computed<number>(() => {
            const val = settings.value?.requiredEquippedProtocols;
            return typeof val === "number" ? val : DEFAULT_REQUIRED_PROTOCOLS;
        });

        function applyCachedConfig() {
            const cached = ConfigCache.load();
            if (!cached) return;

            version.value = cached.version;
            settings.value = {
                requiredEquippedProtocols: DEFAULT_REQUIRED_PROTOCOLS,
                ...cached.settings,
            };
        }

        async function fetchFullConfig(): Promise<boolean> {
            const res = await ExecutorRequest.exec(() => api.getConfig(), {
                loading: isLoading,
            });

            if (!res || typeof res.version !== "number") {
                return false;
            }

            const nextSettings: GameConfigSettings = {
                requiredEquippedProtocols: DEFAULT_REQUIRED_PROTOCOLS,
                ...(res.settings && typeof res.settings === "object" ? res.settings : {}),
            };

            version.value = res.version;
            settings.value = nextSettings;

            ConfigCache.save({
                version: res.version,
                settings: nextSettings,
            });

            return true;
        }

        async function syncConfig(): Promise<boolean> {
            applyCachedConfig();

            const verRes = await ExecutorRequest.exec(() => api.getVersion(), {
                loading: isLoading,
            });

            const remoteVersion =
                typeof verRes === "number" ? verRes : verRes?.version;

            if (typeof remoteVersion !== "number") {
                return false;
            }

            if (remoteVersion > version.value || version.value === 0) {
                return await fetchFullConfig();
            }

            return true;
        }

        return {
            isLoading,
            version,
            settings,
            requiredEquippedProtocols,
            applyCachedConfig,
            fetchFullConfig,
            syncConfig,
        };
    });
};