import { _decorator, Component, Button, Label } from 'cc';
import { ProtocolCard } from 'db://assets/entities/protocols/ui/ProtocolCard';
import { ProtocolEnt } from 'db://assets/entities/protocols/model/classess/protocol.ent';

const { ccclass, property } = _decorator;

@ccclass('ProtocolSelectItem')
export class ProtocolSelectItem extends Component {
    @property(ProtocolCard) card: ProtocolCard = null!;
    @property(Button) plusBtn: Button = null!;
    @property(Button) minusBtn: Button = null!;
    @property(Label) countLabel: Label = null!;

    private _protocol: ProtocolEnt | null = null;
    private _onIncrement: ((protocol: ProtocolEnt) => void) | null = null;
    private _onDecrement: ((protocol: ProtocolEnt) => void) | null = null;

    public init(
        protocol: ProtocolEnt,
        selectedCount: number,
        canAddMore: boolean,
        onIncrement: (protocol: ProtocolEnt) => void,
        onDecrement: (protocol: ProtocolEnt) => void,
    ) {
        this._protocol = protocol;
        this._onIncrement = onIncrement;
        this._onDecrement = onDecrement;

        if (this.card) {
            this.card.init(protocol, true);
        }

        this.updateControls(selectedCount, canAddMore);
    }

    public updateControls(selectedCount: number, canAddMore: boolean) {
        if (this.countLabel) {
            this.countLabel.string = String(selectedCount);
        }
        if (this.minusBtn) {
            this.minusBtn.interactable = selectedCount > 0;
        }
        if (this.plusBtn) {
            this.plusBtn.interactable = canAddMore;
        }
    }

    public onPlusClick() {
        if (this._protocol && this._onIncrement) {
            this._onIncrement(this._protocol);
        }
    }

    public onMinusClick() {
        if (this._protocol && this._onDecrement) {
            this._onDecrement(this._protocol);
        }
    }
}