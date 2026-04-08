// BattleService.ts
import { Enemy, Player } from "../classes";
import { ENEMY_DATABASE } from "../data/EnemyDefinitions";
import { SPACE_SHIPS } from "../enums";
import { getRaidProtocols } from "../enums/SpaceShips.enum";
import { IBattleStatePacket } from "../interfaces/battle/IBattleStatePacket";

export class BattleService {
    public static async fetchInitialBattleState(): Promise<IBattleStatePacket> {
        await new Promise(resolve => setTimeout(resolve, 500));

        const allProtocols = [...getRaidProtocols(SPACE_SHIPS.INTERCEPTOR)];
        const shuffledDeck = this.shuffleArray(allProtocols);

        const handCount = Math.min(shuffledDeck.length, 5);
        const initialHand = shuffledDeck.slice(0, handCount);
        const remainingDeck = shuffledDeck.slice(handCount);

        return {
            players: [{
                id: "p1",
                uid: 1,
                name: "JSONBourne",
                currentHp: 100,
                maxHp: 100,
                currentEnergy: 3,
                energy: 3,
                shield: 0,
                isMyPlayer: true,
                currentSpaceShip: SPACE_SHIPS.INTERCEPTOR
            }],
            enemies: [
                this.createEnemyFromDb("drone_guardian", 101),
                this.createEnemyFromDb("drone_scout", 102)
            ],
            initialHand: initialHand,
            initialDeck: remainingDeck,
            initialDiscard: [],
            initialExhausted: []
        };
    }

    public static rotateEnemiesPattern(enemies: Enemy[]) {
        enemies.forEach(enemy => {
            const config = ENEMY_DATABASE[enemy.id];
            if (!config) return;

            // Мутируем существующий объект
            enemy.currentPatternIndex = (enemy.currentPatternIndex + 1) % config.pattern.length;
            enemy.nextActions = config.pattern[enemy.currentPatternIndex];
            
            console.log(`🔄 Враг ${enemy.name} переключен на паттерн ${enemy.currentPatternIndex}`);
        });
    }


    public static shuffleArray<T>(array: T[]): T[] {
        const result = [...array]; // Работаем с копией
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    private static createEnemyFromDb(id: string, uid: number) {
        const config = ENEMY_DATABASE[id];
        return new Enemy({
            id: config.id,
            uid: uid,
            name: config.name,
            currentHp: config.maxHp,
            maxHp: config.maxHp,
            shield: 0,
            spriteFrame: config.spriteFrame,
            currentPatternIndex: 0,
            nextActions: config.pattern[0]
        });
    }
}