// BattleLogicProcessor.ts
import { BATTLE_EVENT, battleBus } from '../../shared/event-bus/BatleBus';
import { useBattleStore } from '../../store/BattleStore';
import { Protocol } from '../classes/Protocol';
import { ENEMY_INTENT } from '../data/EnemyDefinitions';
import { ITargetConfig, TARGET_SELECTION, TARGET_TYPE } from '../enums/BattleTypes';
import { BattleService } from './BattleService';

export class BattleLogicProcessor {
    private _store = useBattleStore();

    constructor(private manager: any) { }

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

    public executeProtocol(protocol: Protocol, initiator: any, manualTargets: any[] = []) {
        // 1. Сначала определяем, по кому вообще бьет этот протокол
        const finalTargets = this.resolveTargets(protocol.targetConfig, initiator, manualTargets);

        // 2. Проходим по эффектам
        protocol.effects.forEach(effect => {
            // Здесь важный момент: 
            // Некоторые эффекты всегда бьют по целям протокола (урон), 
            // а некоторые могут быть только на себя (энергия).

            // Давай договоримся: если в эффекте не указано иное, он бьет по finalTargets
            this.applyEffect(effect, finalTargets, initiator);
        });
    }

   private resolveTargets(config: ITargetConfig, initiator: any, manualTargets: any[]): any[] {
        const { type, selection, count } = config;

        // 1. Если в конфиге указано SELF — сразу возвращаем только инициатора
        if (type === TARGET_TYPE.SELF) {
            return [initiator];
        }

        // 2. Для остальных случаев (враги/союзники) нам понадобится логика выбора,
        // которую мы напишем следующим шагом.
        return []; 
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

    private applyEffect(source: any, action: any, initiator?: any) {
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