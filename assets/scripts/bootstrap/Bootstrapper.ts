import { _decorator, Component, sys, director, Node, Label, Prefab } from 'cc';
import { GuestLoginRequestDto, useProfileStore, User } from '../../entities/profile';
import { useDialogs } from '../../shared/ui';
import { ColyseusManager } from '../../app/ColyseusManager';

const { ccclass, property } = _decorator;

@ccclass('Bootstrapper')
export class Bootstrapper extends Component {
    @property(Label)
    statusLabel: Label = null; 
    @property(Prefab)
    vanguardSelectionPrefab: Prefab = null; 
    private profileStore = useProfileStore();

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
        this.selectStartVanguard(user.needsInitialSelection);
    }

    private async selectStartVanguard(needsSelection: boolean) {
        if (needsSelection) {
            this.statusLabel.node.active = false; 
            const { showDialog } = useDialogs();
            const selectedVanguard = await showDialog({
                isConfirm: true,
                header: "ВЫБЕРИТЕ АВАНГАРД",
                component: this.vanguardSelectionPrefab,
                dialogOptions:{
                    closable: false,
                    height: 950,
                    width: 800,
                }
            });
            console.log("Выбранный авангард:", selectedVanguard);
            if(selectedVanguard){
                const res = await this.profileStore.setStartVanguard(selectedVanguard.id);
                if(res){
                    this.updateStatus("Доступ разрешен!");
                    this.proceedToLobby();
                }
            }

        }else{
            this.updateStatus("Доступ разрешен!");
            this.proceedToLobby();
        }
    }

     private async proceedToLobby() {
        const user = useProfileStore().user.value;
        if (ColyseusManager.instance) {
                await ColyseusManager.instance.connectToLobby({
                    id: user.id,
                    nickname: user.nickname
                });
            }
        this.updateStatus("Загрузка штаба...");
        director.loadScene('ResourceLoader');
    }

    private generateUUID(): string {
        // Простой генератор для dev-режима
        return 'dev_' + Math.random().toString(36).substring(2, 11);
    }
}