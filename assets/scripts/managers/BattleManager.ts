import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
import { PlayerView } from '../player/PlayerView';
import { useBattleStore } from '../../store/BattleStore';
import { BATTLE_EVENT, battleBus } from '../../shared/event-bus/BatleBus';
import { Protocol } from '../../core/classes/Protocol';
import { Player } from '../../core';
import { BattleLogicProcessor } from '../../core/battle/BattleLogicProcessor';
import { BattleService } from '../../core/battle/BattleService';
import { EnemyView } from '../player/EnemyView';
import { Unit } from '../../core/classes/Unit';
import { TARGET_SELECTION } from '../../core/enums/BattleTypes';

const { ccclass, property } = _decorator;

@ccclass('BattleManager')
export class BattleManager extends Component {
    @property(Prefab) public playerPrefab: Prefab = null!;
    @property(Prefab) public enemyPrefab: Prefab = null!;
    
    @property({ type: [Node], tooltip: 'Точки для игроков' }) 
    public playerSpawnPoints: Node[] = [];

    @property({ type: [Node], tooltip: '4 точки из EnemySpawnManager' }) 
    public enemySpawnPoints: Node[] = []; 

    private _store = useBattleStore();
    private _processor!: BattleLogicProcessor;

    onLoad() {
        this._processor = new BattleLogicProcessor(this);
        battleBus.on(BATTLE_EVENT.TRY_PLAY_PROTOCOL, this.handlePlayProtocol, this);
        battleBus.on(BATTLE_EVENT.UNIT_CLICKED, this.handleUnitClick, this);
    }

    protected onDisable(): void {
        battleBus.off(BATTLE_EVENT.TRY_PLAY_PROTOCOL, this.handlePlayProtocol, this);
        battleBus.off(BATTLE_EVENT.UNIT_CLICKED, this.handleUnitClick, this);
    }

    async start() {
        console.log("🚀 Запуск боевой системы...");
        await this.startBattle();
    }

    public async startBattle() {
        const packet = await BattleService.fetchInitialBattleState();
        this._store.setBattleState(packet);

        if (this._store.isDataReady.value) {
            this.initVisuals();
        }
    }

    private initVisuals() {
        this.spawnPlayers();
        this.spawnEnemies(); 
        battleBus.emit(BATTLE_EVENT.BATTLE_STARTED);
        battleBus.emit(BATTLE_EVENT.HAND_UPDATED, this._store.hand.value);
    }

    /**
     * Спавн врагов строго по точкам
     */
    private spawnEnemies() {
        this._store.enemies.value.forEach((data, index) => {
            // Берем точку по индексу (0, 1, 2 или 3)
            const spawnPoint = this.enemySpawnPoints[index];
            
            if (!spawnPoint) {
                console.error(`❌ Нет точки спавна для врага №${index}`);
                return;
            }

            if (!this.enemyPrefab) {
                console.error("❌ Префаб врага не назначен в BattleManager!");
                return;
            }

            const enemyNode = instantiate(this.enemyPrefab);
            
            // Устанавливаем родителя (точку спавна)
            enemyNode.parent = spawnPoint;
            
            // Обнуляем позицию, чтобы враг встал ровно в центр точки
            enemyNode.setPosition(0, 0, 0);

            // Инициализируем визуальные данные врага (HP, имя и т.д.)
            const view = enemyNode.getComponent(EnemyView);
            if (view) {
                view.initEnemy(data);
            }
        });
    }

    // --- Остальные методы (spawnPlayers, handlePlayProtocol, toggleEndTurn) остаются без изменений ---

    private spawnPlayers() {
        this._store.players.value.forEach((data, index) => {
            const spawnPoint = this.playerSpawnPoints[index];
            if (!spawnPoint || !this.playerPrefab) return;

            const playerNode = instantiate(this.playerPrefab);
            playerNode.parent = spawnPoint;
            playerNode.setPosition(0, 0, 0);

            const view = playerNode.getComponent(PlayerView);
            if (view) view.initPlayer(data);
        });
    }

    private async handlePlayProtocol(protocol: Protocol) {
        const myPlayer = this._store.players.value.find(p => p.isMyPlayer);
        if (!myPlayer || myPlayer.currentEnergy < protocol.cost) return;

        // 1. Сохраняем протокол в стор
        this._store.selectedProtocol.value = protocol;

        // 2. Проверяем конфиг таргетинга
        if (protocol.targetConfig.selection === TARGET_SELECTION.MANUAL) {
            // Переходим в режим выбора цели
            this.enterSelectionMode();
        } else {
            // Если цель AUTO или SELF — разыгрываем сразу (пустой массив целей)
            this.confirmProtocolPlay([]);
        }
    }

    private enterSelectionMode() {
        // Здесь мы визуально меняем состояние
        // 1. Меняем курсор (можно через добавление класса на Canvas или Node)
        // 2. Блокируем кнопку конца хода (она должна смотреть на currentPhase)
        console.log("🎯 Режим выбора целей активирован");
    }

    public cancelSelection() {
        this._store.selectedProtocol.value = null;
        console.log("❌ Выбор отменен");
    }

    private async confirmProtocolPlay(targets: Unit[]) {
        const protocol = this._store.selectedProtocol.value;
        const myPlayer = this._store.players.value.find(p => p.isMyPlayer);
        
        if (!protocol || !myPlayer) return;

        // 1. Отправляем в процессор на выполнение
        // Процессор сам решит, какие эффекты куда летят
        this._processor.executeProtocol(protocol, myPlayer, targets);

        // 2. Списываем ресурсы (уже после подтверждения!)
        myPlayer.currentEnergy -= protocol.cost;
        this._store.hand.value = this._store.hand.value.filter(p => p.uid !== protocol.uid);
        this._store.discard.value.push(protocol);

        // 3. Сброс состояния
        this._store.selectedProtocol.value = null;
        this.syncPlayerState(myPlayer);
    }

    private handleUnitClick(target: Unit) {
        // 1. Проверяем, выбрана ли карта в сторе
        const protocol = this._store.selectedProtocol.value;
        if (!protocol) {
            // Если карта не выбрана, можно просто показать инфо о юните (по желанию)
            return;
        }

        // 2. Если карта выбрана и мы в фазе действий игрока
        // (Пока упрощаем: считаем, что любая карта требует 1 цель)
        this.confirmProtocolPlay([target]);
    }

    public async toggleEndTurn() {
        const myPlayer = this._store.players.value.find(p => p.isMyPlayer);
        if (!myPlayer) return;

        this._store.toggleEndTurn(myPlayer);
        battleBus.emit(BATTLE_EVENT.SYNC_READY_PLAYERS, this._store.turnEndedPlayers.value);

        if (this._store.turnEndedPlayers.value.length === this._store.players.value.length) {
            await this.runFullTurnCycle();
        }
    }

    private async runFullTurnCycle() {
        await this._processor.executeEnemyPhase();
        await new Promise(resolve => setTimeout(resolve, 800));

        if (this._store.hand.value.length > 0) {
            this._store.discard.value.push(...this._store.hand.value);
            this._store.hand.value = [];
            battleBus.emit(BATTLE_EVENT.HAND_UPDATED, this._store.hand.value);
        }

        await this.startNewPlayerTurn();
    }

    private async startNewPlayerTurn() {
        this._store.turn.value++;
        const myPlayer = this._store.players.value.find(p => p.isMyPlayer);
        if (!myPlayer) return;

        this._store.turnEndedPlayers.value = [];
        battleBus.emit(BATTLE_EVENT.SYNC_READY_PLAYERS, []);
        myPlayer.currentEnergy = myPlayer.energy;

        await this._processor.drawProtocols(5);
        this.syncPlayerState(myPlayer);
    }

    private syncPlayerState(player: Player) {
        battleBus.emit(BATTLE_EVENT.HAND_UPDATED, this._store.hand.value);
        battleBus.emit(BATTLE_EVENT.PLAYER_ENERGY_CHANGED, {
            currentEnergy: player.currentEnergy,
            maxEnergy: player.energy
        });
    }
}