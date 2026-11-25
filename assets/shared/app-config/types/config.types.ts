export const CONFIG_CACHE_KEY = "voidscrappers_app_config_v1";
export const DEFAULT_REQUIRED_PROTOCOLS = 13;

export interface GameConfigSettings {
    requiredEquippedProtocols?: number;
    [key: string]: unknown;
}

export interface GameConfigVersionResponse {
    version: number;
}

export interface GameConfigResponse {
    version: number;
    settings: GameConfigSettings;
}

export interface CachedGameConfig {
    version: number;
    settings: GameConfigSettings;
}