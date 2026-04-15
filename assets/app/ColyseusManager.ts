import { _decorator, Component, director } from 'cc';
import Colyseus from 'db://colyseus-sdk/colyseus.js';
import { useLobbyStore } from '../shared/store/lobby/model/lobby.store';
import { useDialogs } from '../shared/ui';

const { ccclass } = _decorator;

@ccclass('ColyseusManager')
export class ColyseusManager extends Component {
    public static instance: ColyseusManager = null!;

    private client: Colyseus.Client = null!;
    private lobbyRoom: Colyseus.Room = null!;
    private privateRoom: Colyseus.Room = null!;

    private isDuplicate: boolean = false;
    private _isReadyResolver: (value: boolean) => void = null!;

    public isReady: Promise<boolean> = new Promise((resolve) => {
        this._isReadyResolver = resolve;
    });

    onLoad() {
        if (this.node.parent !== null) this.node.setParent(null);

        if (ColyseusManager.instance && ColyseusManager.instance !== this) {
            this.isDuplicate = true;
            this.node.destroy();
            return;
        }

        ColyseusManager.instance = this;
        director.addPersistRootNode(this.node);

        // Адрес сервера вынеси потом в конфиг
        this.client = new Colyseus.Client("ws://localhost:3000");
    }

    public get sessionId() {
        return this.lobbyRoom?.sessionId;
    }

    /**
     * Основной вход в игру через лобби
     */
    public async connectToLobby(userData: { id: string, nickname: string, vanguardKey: string, vanguardId: string }) {
        try {
            // 1. Личный канал (для уведомлений вне комнат)
            this.privateRoom = await this.client.joinOrCreate("private", { userId: userData.id });

            // 2. Основное лобби
            this.lobbyRoom = await this.client.joinOrCreate("lobby", userData);

            console.log("✅ [Colyseus] Подключено к лобби");

            this.setupLobbyListeners();
            this.setupLobbyMessages();

        } catch (e) {
            console.error("❌ [Colyseus] Ошибка подключения:", e);
        }
    }

    /**
     * Синхронизация стейта сервера со Стором (PinaColada)
     */
    private setupLobbyListeners() {
        const lobbyStore = useLobbyStore();
        const state = this.lobbyRoom.state as any;

        // 1. ГЛАВНЫЕ ВРАТА: Если стейт или игроки еще не созданы — ждем
        if (!state || !state.players) {
            console.warn("⏳ [Lobby] Стейт еще не готов, ждем синхронизации...");
            // Подписываемся на ПЕРВОЕ изменение, чтобы попробовать снова
            this.lobbyRoom.onStateChange.once(() => this.setupLobbyListeners());
            return;
        }

        // 2. СИЛОВОЙ МЕТОД (Обновление при любом чихе сервера)
        this.lobbyRoom.onStateChange((latestState) => {
            if (!latestState || !latestState.players) return;

            latestState.players.forEach((player: any, sessionId: string) => {
                lobbyStore.updatePlayer(sessionId, player.toJSON());
            });
        });

        // 3. СЛУШАТЕЛИ УДАЛЕНИЯ (Теперь безопасно, так как state.players точно есть)
        state.players.onRemove = (player: any, sessionId: string) => {
            console.log(`🚪 [Lobby] Игрок вышел: ${sessionId}`);
            lobbyStore.removePlayer(sessionId);
        };

        // 4. СЛУШАТЕЛЬ РЕЙДА
        // Проверяем наличие объекта перед тем как вешать listen/onChange
        if (state.selectedRaid) {
            // Если твоя версия не ест .listen на стейте, используй onChange на самом объекте
            state.selectedRaid.onChange = () => {
                lobbyStore.setRaid(state.selectedRaid.toJSON());
            };
        }

        // 5. ПЕРВИЧНЫЙ ЗАПУСК
        state.players.forEach((p: any, sid: string) => {
            lobbyStore.updatePlayer(sid, p.toJSON());
        });

        console.log("✅ [Lobby] Слушатели успешно установлены!");
        if (this._isReadyResolver) this._isReadyResolver(true);
    }

    /**
     * Обработка разовых событий (сообщений)
     */
    private async setupLobbyMessages() {
        console.log("BEFORE")
        if (!this.lobbyRoom) return;
        console.log("AFTER")

        // Входящий инвайт
        this.lobbyRoom.onMessage("INVITE_RECEIVED", async (data) => {
            const confirm = await useDialogs().showDialog({
                header: "ВЫЗОВ",
                text: `Пилот ${data.fromName} приглашает в звено. Принимаем?`,
                isConfirm: true,
                confirmBtnText: "ПРИНЯТЬ",
                rejectBtnText: "ОТКЛОНИТЬ"
            });

            if (confirm) {
                this.sendAcceptInvite(data.fromSessionId);
            } else {
                this.sendDeclineInvite();
            }
        });

        // Отчеты по инвайтам (ошибки/таймауты)
        this.lobbyRoom.onMessage("INVITE_REPORT", (data: { success: boolean, reason?: string }) => {
            if (!data.success) {
                useDialogs().showDialog({
                    header: "ОТКАЗ",
                    text: data.reason || "Связь со штабом прервана.",
                    isConfirm: false
                });
            }
        });

        // Команда на переход в боевую сцену
        this.lobbyRoom.onMessage("JOIN_RAID_SESSION", async (data) => {
            const raidRoom = await this.joinRoomByReservation(data);
            if (raidRoom) {
                director.loadScene('MapScene');
            }
        });

        // Общие ошибки
        this.lobbyRoom.onMessage("ERROR", (msg) => {
            useDialogs().showDialog({ header: "ОШИБКА", text: msg, isConfirm: false });
        });
    }

    // --- МЕТОДЫ ОТПРАВКИ (ACTIONS) ---

    public sendInvite(targetUserId: string) {
        this.lobbyRoom?.send("INVITE_FRIEND", { targetId: targetUserId });
    }

    public sendAcceptInvite(inviterSessionId: string) {
        this.lobbyRoom?.send("ACCEPT_INVITE", { inviterSessionId });
    }

    public sendDeclineInvite() {
        this.lobbyRoom?.send("DECLINE_INVITE");
    }

    public sendLeaveParty() {
        this.lobbyRoom?.send("LEAVE_PARTY");
    }

    public sendToggleReady() {
        this.lobbyRoom?.send("TOGGLE_READY");
    }

    public sendSelectRaid(raidData: any) {
        this.lobbyRoom?.send("SELECT_RAID", raidData);
    }

    public sendStartRaid(locationId: string) {
        this.lobbyRoom?.send("START_RAID_FLOW", { locationId });
    }

    // --- СЕРВИСНЫЕ МЕТОДЫ ---

    private async joinRoomByReservation(reservation: any) {
        try {
            return await this.client.consumeSeatReservation(reservation);
        } catch (e) {
            console.error("❌ [Colyseus] Ошибка входа по билету:", e);
        }
    }

    public async leaveLobby() {
        if (this.isDuplicate) return;
        if (this.lobbyRoom) {
            this.lobbyRoom.removeAllListeners();
            await this.lobbyRoom.leave();
            this.lobbyRoom = null!;
        }
    }

    onDestroy() {
        if (!this.isDuplicate) this.leaveLobby();
    }
}