import { _decorator, Component, Label, Button, Sprite, Node } from 'cc';
import { RaidItem } from './classess/raidI-tem';
import { AppButton } from 'db://assets/shared/ui';
import { RemoteImageLoader } from 'db://assets/shared/infra/remote-image-loader';


const { ccclass, property } = _decorator;

@ccclass('RaidItemEnt')
export class RaidItemEnt extends Component {
    @property(Label) 
    titleLabel: Label = null!;

    // Это ссылка на DificultLabel из твоей иерархии
    @property(Label) 
    difficultyLabel: Label = null!;

    @property(AppButton) 
    selectBtn: AppButton = null!;

    @property(Sprite) iconSprite: Sprite = null!;
    @property(Node) loadingIconNode: Node = null!;
    
    private raidData: RaidItem | null = null;

    public init(raid: RaidItem) {
        this.raidData = raid;
        console.log("RAID:", raid)
        if (this.titleLabel) this.titleLabel.string = raid.name || 'НЕИЗВЕСТНАЯ ЗОНА';
        // Теперь мы передаем только само значение, без слова "СЛОЖНОСТЬ"
        if (this.difficultyLabel) this.difficultyLabel.string = raid.difficulty || '???'; 
        console.log("ICON URL:", raid.iconImage);
        this.loadIcon(raid.iconImage);
        // Кнопка уже красивая благодаря Инспектору. Просто вешаем слушатель.
        if (this.selectBtn) {
            this.selectBtn.node.off(Button.EventType.CLICK);
            this.selectBtn.node.on(Button.EventType.CLICK, this.onSelectClick, this);
        }
    }

    private async loadIcon(exactUrl: string | null) {
        if (!this.iconSprite || !exactUrl) return;

        if (this.loadingIconNode) this.loadingIconNode.active = true;
        this.iconSprite.node.active = false;

        // Передаем точный URL без всяких папок
        const spriteFrame = await RemoteImageLoader.loadSprite(exactUrl);

        if (!this.isValid) return; 

        if (this.loadingIconNode) this.loadingIconNode.active = false;

        if (spriteFrame && this.iconSprite.isValid) {
            this.iconSprite.spriteFrame = spriteFrame;
            this.iconSprite.node.active = true;
        }
    }

    private onSelectClick() {
        if (!this.raidData) return;
        this.node.emit('raid-selected', this.raidData);
    }
}