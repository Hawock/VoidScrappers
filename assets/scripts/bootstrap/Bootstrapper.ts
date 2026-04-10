import { _decorator, Component, sys, director, Node, Label } from 'cc';
import { GuestLoginRequestDto, useProfileStore } from '../../entities/profile';
import * as cc from 'cc';

const { ccclass, property } = _decorator;

@ccclass('Bootstrapper')
export class Bootstrapper extends Component {
    @property(Label)
    statusLabel: Label = null; // Чтобы игрок видел, что происходит

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
        try {
            // 1. Работа с Device ID
            let deviceId = sys.localStorage.getItem('deviceId');
            
            if (!deviceId) {
                this.updateStatus("Генерация идентификатора...");
                deviceId = this.generateUUID();
                sys.localStorage.setItem('deviceId', deviceId);
            }

            // 2. Авторизация через наш Store/API
            this.updateStatus("Авторизация в Сети...");
            
            const loginDto: GuestLoginRequestDto = {
                deviceId: deviceId,
                nickname: "Авангард" // Можно потом дать игроку ввести имя
            };

            const success = await this.profileStore.guestLogin(loginDto);

            if (success) {
                this.updateStatus("Доступ разрешен!");
                
                // Сохраняем токен в localStorage для автоматического входа в следующий раз
                // Хотя Api.ts берет его из Store, после перезагрузки Store пуст.
                sys.localStorage.setItem('token', this.profileStore.token.value);

                // 3. Загрузка основной сцены
                this.proceedToLobby();
            } else {
                this.updateStatus("Ошибка входа. Проверьте сервер.");
            }

        } catch (e) {
            this.updateStatus("Критическая ошибка запуска.");
            console.error(e);
        }
    }

    private proceedToLobby() {
        this.updateStatus("Загрузка штаба...");
        director.loadScene('ResourceLoader');
    }

    private generateUUID(): string {
        // Простой генератор для dev-режима
        return 'dev_' + Math.random().toString(36).substring(2, 11);
    }
}