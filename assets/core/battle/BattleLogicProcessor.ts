// BattleLogicProcessor.ts
import { BATTLE_EVENT, battleBus } from '../../scripts/event-bus/BatleBus';
import { useBattleStore } from '../../store/BattleStore';
import { ENEMY_INTENT } from '../data/EnemyDefinitions';
import { BattleService } from './BattleService';

export class BattleLogicProcessor {
    private _store = useBattleStore();

    constructor(private manager: any) {} 

    /**
     * Добор протоколов с проверкой пустой колоды
     */
    public async drawProtocols(count: number) {
        for (let i = 0; i < count; i++) {
            // 1. Если колода (deck) пуста — перемешиваем сброс (discard)
            if (this._store.deck.value.length === 0) {
                // Если и в сбросе ничего нет — протоколы закончились совсем
                if (this._store.discard.value.length === 0) {
                    console.log("⚠️ Все протоколы использованы (колода и сброс пусты)");
                    break;
                }

                console.log("🔄 Колода пуста. Перемешиваем сброс в новую колоду...");
                const newDeck = BattleService.shuffleArray(this._store.discard.value);
                this._store.deck.value = newDeck;
                this._store.discard.value = [];
            }

            // 2. Берем протокол из колоды в руку
            const protocol = this._store.deck.value.pop();
            if (protocol) {
                this._store.hand.value.push(protocol);
            }
        }
    }

    /**
     * Логика фазы врага
     */
    public async executeEnemyPhase() {
        const enemies = this._store.enemies.value;

        // 1. Враги бьют
        for (const enemy of enemies) {
            await this.executeSingleEnemyTurn(enemy);
            // Если HP игрока изменилось — кричим об этом
            battleBus.emit(BATTLE_EVENT.UNIT_UPDATED, { uid: this._store.players.value[0].uid });
        }

        // 2. Меняем паттерны врагов (мутация внутри объектов)
        BattleService.rotateEnemiesPattern(enemies);

        // 3. Кричим каждому врагу, что пора обновить визуал интента
        enemies.forEach(enemy => {
            battleBus.emit(BATTLE_EVENT.UNIT_UPDATED, { uid: enemy.uid });
        });
    }

    private async executeSingleEnemyTurn(enemy: any) {
        for (const action of enemy.nextActions) {
            console.log(`Враг ${enemy.name} исполняет протокол: ${action.intent}`);

            // Визуал в Cocos
            // await this.manager.playEnemyAnimation(enemy.uid, action);

            this.applyEffect(enemy, action);

            await new Promise(resolve => setTimeout(resolve, 600));
        }
    }

    private applyEffect(source: any, action: any) {
        const player = this._store.players.value[0]; 
        
        switch (action.intent) {
            case ENEMY_INTENT.ATTACK:
                player.currentHp -= action.value;
                break;
            case ENEMY_INTENT.BUFF:
                source.shield += action.value;
                break;
        }
    }
}