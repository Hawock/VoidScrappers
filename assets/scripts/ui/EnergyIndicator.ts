import { _decorator, Component, Label, Node } from 'cc';
import { BATTLE_EVENT, battleBus } from '../../shared/event-bus/BatleBus';
const { ccclass, property } = _decorator;

@ccclass('EnergyIndicator')
export class EnergyIndicator extends Component {
    @property(Label) public maxEnergyLabel: Label = null!;
    @property(Label) public currentEnergyLabel: Label = null!;

    updateEnergy(energyData: { maxEnergy: number, currentEnergy: number }) {
        this.maxEnergyLabel.string = energyData.maxEnergy.toString();
        this.currentEnergyLabel.string = energyData.currentEnergy.toString();
    }   

    onEnable(){
        battleBus.on(BATTLE_EVENT.PLAYER_ENERGY_CHANGED, this.updateEnergy, this);
    }

    protected onDisable(): void {
        battleBus.off(BATTLE_EVENT.PLAYER_ENERGY_CHANGED, this.updateEnergy, this);
    }
}


