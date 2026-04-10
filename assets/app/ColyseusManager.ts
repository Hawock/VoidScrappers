import { _decorator, Component, director } from 'cc';
import Colyseus from 'db://colyseus-sdk/colyseus.js';
import { useLobbyStore } from '../shared/store/lobby/lobby.store';

const { ccclass } = _decorator;

@ccclass('ColyseusManager')
export class ColyseusManager extends Component {
    public static instance: ColyseusManager = null!;
    private client: Colyseus.Client = null!;
    private privateRoom: Colyseus.Room = null!;
    private lobbyRoom: Colyseus.Room = null!;
    private isDuplicate: boolean = false;
    private _isReadyResolver: (value: boolean) => void = null!;
    public isReady: Promise<boolean> = new Promise((resolve) => {
        this._isReadyResolver = resolve;
    });

    onLoad() {
        // 1. ПРИНУДИТЕЛЬНО В КОРЕНЬ
        if (this.node.parent !== null) {
            this.node.setParent(null);
        }

        if (ColyseusManager.instance && ColyseusManager.instance !== this) {
            this.isDuplicate = true;
            this.node.destroy();
            return;
        }
        ColyseusManager.instance = this;

        // 2. ЗАПРОС ПЕРСИСТЕНТНОСТИ
        director.addPersistRootNode(this.node);

        // 3. ПРОВЕРКА (Критично!)
        if (!director.isPersistRootNode(this.node)) {
            console.error("❌❌❌ [Lobby] COCOS ОТКЛОНИЛ PERSISTENT! Менеджер умрет при смене сцены!");
        } else {
            console.log("💎 [Lobby] Менеджер официально бессмертен.");
        }

        this.client = new Colyseus.Client("ws://localhost:3000");
    }
    /**
     * Основной вход в лобби
     */
    public async connectToLobby(userData: { id: string, nickname: string }) {
        try {
            this.privateRoom = await this.client.joinOrCreate("private", { 
                userId: userData.id 
            });
            console.log("🤫 [Private] Личный канал открыт");

            this.lobbyRoom = await this.client.joinOrCreate("lobby", {
                partyId: userData.id, // Ключ для фильтрации на сервере
                ...userData 
            });
            console.log("✅ [Lobby] Подключено успешно");
            // Запускаем синхронизацию данных со Стором
            this.setupLobbyListeners();

            // --- ОБРАБОТКА СООБЩЕНИЙ ---

            // Приглашение в группу
            this.lobbyRoom.onMessage("INVITE_RECEIVED", (data) => {
                console.log(`📩 Пришло приглашение от ${data.fromName}!`);
                // Здесь будет вызов UI диалога
            });

            // Команда на запуск рейда (прилетает всем участникам)
            this.lobbyRoom.onMessage("JOIN_RAID_SESSION", async (data) => {
                console.log("✈️ Рейд запущен сервером! Переходим...");

                await this.joinRoomByReservation(data);
                director.loadScene('MapScene');
            });

        } catch (e) {
            console.error("❌ [Lobby] Ошибка подключения:", e);
        }
    }

    /**
     * Настройка синхронизации Colyseus State -> PinaColada Store
     */
    private setupLobbyListeners() {
        const lobbyStore = useLobbyStore();
        const state = this.lobbyRoom.state as any;

        // Защита от пустого стейта (ждем первый пакет)
        if (!state || !state.players) {
            console.warn("⏳ [Lobby] Ждем синхронизации...");
            this.lobbyRoom.onStateChange.once(() => this.setupLobbyListeners());
            return;
        }

        const players = state.players;

        // 1. Слушатель добавления (Синтаксис через РАВНО)
        players.onAdd = (player: any, sessionId: string) => {
            console.log(`👤 [Lobby] Игрок зашел: ${sessionId}`);
            lobbyStore.updatePlayer(sessionId, player.toJSON());

            player.onChange = () => {
                lobbyStore.updatePlayer(sessionId, player.toJSON());
                lobbyStore.checkAutoStart();
            };
        };

        // 2. Слушатель удаления
        players.onRemove = (player: any, sessionId: string) => {
            lobbyStore.removePlayer(sessionId);
        };

        // 3. Слушатель рейда
        if (state.selectedRaid) {
            state.selectedRaid.onChange = () => {
                const raidData = state.selectedRaid.toJSON();
                if (raidData.id) {
                    lobbyStore.setRaid(raidData);
                    lobbyStore.checkAutoStart();
                }
            };
        }

        // 4. Первичная проходка по уже зашедшим
        players.forEach((player: any, sessionId: string) => {
            lobbyStore.updatePlayer(sessionId, player.toJSON());
        });

        // СИГНАЛ ГОТОВНОСТИ: Теперь Бутстраппер может менять сцену
        console.log("🚀 [Lobby] Стейт синхронизирован. Разрешаем вход.");
        if (this._isReadyResolver) this._isReadyResolver(true);
    }
    /**
     * Вход в боевую комнату по билету
     */
    public async joinRoomByReservation(reservation: any) {
        try {
            console.log("🎟️ [Raid] Вход по билету...");
            const room = await this.client.consumeSeatReservation(reservation);
            console.log(`⚔️ [Raid] Успешно зашли в комнату: ${room.name}`);
            return room;
        } catch (e) {
            console.error("❌ [Raid] Ошибка входа по билету:", e);
        }
    }

    /**
     * Выход из лобби с очисткой
     */
    public async leaveLobby() {
        // Если мы дубликат — уходим молча, не закрывая сокет основного менеджера
        if (this.isDuplicate) return;

        if (this.lobbyRoom) {
            this.lobbyRoom.removeAllListeners();
            await this.lobbyRoom.leave();
            this.lobbyRoom = null!;
            console.log("🧹 [Lobby] Вышли из лобби (настоящий выход)");
        }
    }

    onDestroy() {
        if (!this.isDuplicate) {
            // Эта строка покажет в консоли дерево функций, которые привели к смерти
            console.trace("💀 КТО УБИЛ МЕНЕДЖЕРА?"); 
            this.leaveLobby();
        }
    }

    // --- МЕТОДЫ ОТПРАВКИ (ACTIONS) ---

    public sendInvite(targetUserId: string) {
        if (this.lobbyRoom) {
            this.lobbyRoom.send("INVITE_FRIEND", { targetId: targetUserId });
        }
    }

    public acceptInvite(inviterSessionId: string) {
        if (this.lobbyRoom) {
            this.lobbyRoom.send("ACCEPT_INVITE", { inviterSessionId });
        }
    }

    public selectRaid(raidData: any) {
        if (this.lobbyRoom) {
            console.log(`📡 [Lobby] Отправляем выбор рейда: ${raidData.name}`);
            this.lobbyRoom.send("SELECT_RAID", raidData);
        }
    }

    public toggleReady() {
        if (this.lobbyRoom) {
            this.lobbyRoom.send("TOGGLE_READY");
        }
    }

    /**
     * Финальный запрос на старт (обычно вызывается автоматически из Стора)
     */
    public sendStartRaid(locationId: string) {
        if (this.lobbyRoom) {
            this.lobbyRoom.send("START_RAID_FLOW", { locationId });
        }
    }
}