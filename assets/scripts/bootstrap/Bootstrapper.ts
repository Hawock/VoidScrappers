import { DEV } from 'cc/env';
import { _decorator, Component, sys, director, Label, Prefab } from 'cc';
import { GuestLoginRequestDto, useProfileStore } from '../../entities/profile';
import { useDialogs } from '../../shared/ui';
import { ColyseusManager } from '../../app/ColyseusManager';
import { useConfigStore } from '../../shared/app-config';
import { StoreDevtoolsService } from '../../shared/infra/store-devtools/store-devtools.service';
import { useLoadoutStore } from '../../entities/loadout/model/loadout.store';

const { ccclass, property } = _decorator;

@ccclass('Bootstrapper')
export class Bootstrapper extends Component {
    @property(Label)
    statusLabel: Label = null; 
    @property(Prefab)
    vanguardSelectionPrefab: Prefab = null; 

    private profileStore = useProfileStore();
    private loadoutStore = useLoadoutStore();

    async start() {
        window['cc'] = cc;
        this.updateStatus("Инициализация системы...");
        await this.initGame();
    }

    private updateStatus(text: string) {
        if (this.statusLabel) this.statusLabel.string = text;
        console.log(`[Boot] ${text}`);
    }

    async initGame() {
        if (DEV) StoreDevtoolsService.exposeToWindow();
        let deviceId = sys.localStorage.getItem('deviceId');

        if (!deviceId) {
            this.updateStatus("Генерация идентификатора...");
            deviceId = this.generateUUID();
            sys.localStorage.setItem('deviceId', deviceId);
        }
        this.updateStatus("Авторизация в Сети...");

        const loginDto: GuestLoginRequestDto = {
            deviceId: deviceId,
            nickname: "Авангард"
        };
        const loginResult = await this.profileStore.guestLogin(loginDto);
        if (!loginResult) return console.error("Ошибка при попытке входа гостя!");

        const user = await this.profileStore.getFullProfile();
        if (!user) return console.error("Ошибка при загрузке профиля после входа!");

        const configStore = useConfigStore();
        configStore.applyCachedConfig();
        this.updateStatus("Синхронизация конфигурации...");
        await configStore.syncConfig();

        const loadout = await this.loadoutStore.fetchLoadout();
        this.selectStartVanguard(!loadout);
    }

    private async selectStartVanguard(needsSelection: boolean) {
        if (needsSelection) {
            this.statusLabel.node.active = false; 
            const { showDialog } = useDialogs();
            const selectedVanguard = await showDialog({
                isConfirm: true,
                header: "ВЫБЕРИТЕ АВАНГАРД",
                component: this.vanguardSelectionPrefab,
                dialogOptions: {
                    closable: false,
                    height: 950,
                    width: 800,
                }
            });
            console.log("Выбранный авангард:", selectedVanguard);
            if (selectedVanguard) {
                const res = await this.profileStore.setStartVanguard(selectedVanguard.id);
                if (res) {
                    await this.loadoutStore.fetchLoadout();
                    this.updateStatus("Доступ разрешен!");
                    this.proceedToLobby();
                }
            }
        } else {
            this.updateStatus("Доступ разрешен!");
            this.proceedToLobby();
        }
    }

    private async proceedToLobby() {
        const user = this.profileStore.user.value;
        const loadout = this.loadoutStore.loadout.value;

        if (ColyseusManager.instance && user && loadout) {
            await ColyseusManager.instance.connectToLobby({
                id: user.id,
                nickname: user.nickname,
                vanguardId: loadout.id,
                vanguardKey: loadout.vanguardName
            });
        }
        this.updateStatus("Загрузка штаба...");
        director.loadScene('ResourceLoader');
    }

    private generateUUID(): string {
        return 'dev_' + Math.random().toString(36).substring(2, 11);
    }
}