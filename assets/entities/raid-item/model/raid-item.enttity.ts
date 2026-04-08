import { _decorator, Component, Label, Button } from 'cc';
import { RaidItem } from './classess/raidI-tem'; // Наша "душа" (данные)
import { AppButton, ButtonTypeEnum } from 'db://assets/shared/ui';


const { ccclass, property } = _decorator;

@ccclass('RaidItemEnt') // Наше "тело" (визуал)
export class RaidItemEnt extends Component {
    @property(Label) 
    titleLabel: Label = null!;

    @property(Label) 
    difficultyLabel: Label = null!;

    @property(AppButton) 
    selectBtn: AppButton = null!;

    private raidData: RaidItem | null = null;

    public init(raid: RaidItem) {
        this.raidData = raid;

        // Мапим данные на UI
        if (this.titleLabel) this.titleLabel.string = raid.name || 'НЕИЗВЕСТНАЯ ЗОНА';
        if (this.difficultyLabel) this.difficultyLabel.string = `СЛОЖНОСТЬ:\n${raid.difficulty || '???'}`;

        if (this.selectBtn) {
            this.selectBtn.setup({
                text: "Выбрать",
                type: ButtonTypeEnum.PRIMARY
            });

            this.selectBtn.node.off(Button.EventType.CLICK);
            this.selectBtn.node.on(Button.EventType.CLICK, this.onSelectClick, this);
        }
    }

    private onSelectClick() {
        if (!this.raidData) return;
        this.node.emit('raid-selected', this.raidData);
    }
}