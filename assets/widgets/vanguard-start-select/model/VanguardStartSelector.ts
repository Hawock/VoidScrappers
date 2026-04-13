import { _decorator, Component, Node, Prefab, instantiate, Button, Label } from 'cc';
import { useProfileStore } from 'db://assets/entities/profile';
import { VanguardItem } from 'db://assets/entities/start-vanguard/model/VanguardItem';

// import { VanguardApiService } from '../../api/vanguard.api'; // Раскоментируешь потом
const { ccclass, property } = _decorator;

@ccclass('VanguardSelector')
export class VanguardSelector extends Component {
    @property(Prefab) itemPrefab: Prefab = null!;
    @property(Node) contentContainer: Node = null!; // Твоя нода Content, где Layout
    @property(Button) confirmButton: Button = null!;
    
    // Ссылка на сам диалог (прокидывается менеджером диалогов, если используешь props)
    public dialogProps: any; 
    private profileStore = useProfileStore();
    private selectedId: string | null = null;
    private spawnedItems: VanguardItem[] = [];
    // private api = new VanguardApiService();

    protected onLoad() {
        // Выключаем кнопку до того, как игрок сделает выбор
        this.confirmButton.interactable = false;
        
        // Вешаем слушатель на кнопку подтверждения
        this.confirmButton.node.on(Button.EventType.CLICK, this.onConfirmClicked, this);
    }

    protected start() {
        this.loadVanguards();
    }

    private async loadVanguards() {
        const vanguards = await this.profileStore.getStartVanguards(); 
        this.populateGrid(vanguards);
    }

    private populateGrid(vanguards: {id: string, name: string}[]) {
        // Очищаем контейнер, если там были тестовые ноды
        this.contentContainer.removeAllChildren();
        this.spawnedItems = [];

        for (const vg of vanguards) {
            const itemNode = instantiate(this.itemPrefab);
            const itemComp = itemNode.getComponent(VanguardItem);
            
            if (itemComp) {
                itemComp.init(vg.id, vg.name);
                this.spawnedItems.push(itemComp);
                
                // Подписываемся на клик по карточке
                itemNode.on(Node.EventType.TOUCH_END, () => this.onItemClicked(itemComp), this);
            }
            
            this.contentContainer.addChild(itemNode);
        }
    }

    private onItemClicked(clickedItem: VanguardItem) {
        this.selectedId = clickedItem.vanguardId;
        
        // Обновляем визуал всех карточек
        for (const item of this.spawnedItems) {
            item.setSelected(item.vanguardId === this.selectedId);
        }
        // Включаем кнопку подтверждения
        this.confirmButton.interactable = true;
    }

    private onConfirmClicked() {
        if (!this.selectedId) return;
        this.confirmButton.interactable = false; 
        this.node.emit('confirm', { id: this.selectedId });
    }
}