export interface EffectDto {
    id: string;
    name: string;
    description: string | null;
    intentType: string | null;
    statusIcon: string | null;
    handlerKey: string;
    hook: string;
    expiration: string;
}