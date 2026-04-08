import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
import { RaidItem, useRaidStore } from '../../../entities/raid-item';
import { RaidItemEnt } from 'db://assets/entities/raid-item/model/RaidItemEnt';

const { ccclass, property } = _decorator;

@ccclass('RaidListWidget')
export class RaidListWidget extends Component {
    @property(Node) contentLayout: Node = null!; 
    @property(Prefab) raidItemPrefab: Prefab = null!; 
    @property(Node) loadingIndicator: Node = null!; // Текст "Загрузка..." или крутилка

    start() {
        const store = useRaidStore();

        // Подписываемся на стор
        store.raids.events.on('changed', this.onRaidsChanged, this);
        store.isLoading.events.on('changed', this.onLoadingChanged, this);

        // Инициализируем UI текущим стейтом (вдруг данные уже есть)
        this.onLoadingChanged(store.isLoading.value);
        if (store.raids.value.length > 0) {
            this.onRaidsChanged(store.raids.value);
        }

        // Просим стор загрузить данные (он сам решит, нужно ли делать API запрос)
        store.getRaidList();
    }

    private onLoadingChanged(isLoading: boolean) {
        if (this.loadingIndicator) {
            this.loadingIndicator.active = isLoading;
        }
    }

    private onRaidsChanged(raids: RaidItem[]) {
        this.contentLayout.removeAllChildren();

        raids.forEach(raid => {
            const itemNode = instantiate(this.raidItemPrefab);
            console.log("INSTANTIATED ITEM NODE:", itemNode)
            this.contentLayout.addChild(itemNode);

            const itemScript = itemNode.getComponent(RaidItemEnt);
            console.log("ITEM SCRIPT:", itemScript)
            if (itemScript) {
                itemScript.init(raid);
                
                // 1. Слушаем событие от плашки
                itemNode.on('raid-selected', (data: RaidItem) => {
                    // 2. Кидаем его в AppDialog. 
                    // Помнишь, AppDialog слушает 'confirm' у customNode?
                    this.node.emit('confirm', data); 
                });
            }
        });
    }

    onDestroy() {
        const store = useRaidStore();
        store.raids.events.off('changed', this.onRaidsChanged, this);
        store.isLoading.events.off('changed', this.onLoadingChanged, this);
    }
}