import { sys } from "cc";
import { CachedGameConfig, CONFIG_CACHE_KEY, DEFAULT_REQUIRED_PROTOCOLS } from "../types/config.types";


export class ConfigCache {
    public static load(): CachedGameConfig | null {
        try {
            const raw = sys.localStorage.getItem(CONFIG_CACHE_KEY);
            if (!raw) return null;

            const parsed = JSON.parse(raw) as Partial<CachedGameConfig>;
            if (typeof parsed.version !== "number") return null;

            return {
                version: parsed.version,
                settings: {
                    requiredEquippedProtocols: DEFAULT_REQUIRED_PROTOCOLS,
                    ...(parsed.settings && typeof parsed.settings === "object"
                        ? parsed.settings
                        : {}),
                },
            };
        } catch (err) {
            console.warn("[CONFIG] Ошибка чтения кэша из localStorage:", err);
            return null;
        }
    }

    public static save(data: CachedGameConfig): void {
        try {
            sys.localStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify(data));
        } catch (err) {
            console.warn("[CONFIG] Ошибка записи кэша в localStorage:", err);
        }
    }

    public static clear(): void {
        try {
            sys.localStorage.removeItem(CONFIG_CACHE_KEY);
        } catch (err) {
            console.warn("[CONFIG] Ошибка очистки кэша в localStorage:", err);
        }
    }
}
