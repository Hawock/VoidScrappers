import { _decorator, Component, Node, Label, Prefab, instantiate } from 'cc';
import { watch } from 'db://assets/shared/infra/reactivity';
import { useInventoryStore } from 'db://assets/entities/inventory/model/inventory.store';
import { UserModule } from 'db://assets/entities/module/model/classess/module';
import { ProtocolEnt } from 'db://assets/entities/protocols/model/classess/protocol.ent';
import { ProtocolSelectItem } from 'db://assets/feature/protocol-select-item/ui/ProtocolSelectItem';

const { ccclass, property } = _decorator;

@ccclass('RightPanelView')
export class RightPanelView extends Component {
    @property(Node) emptyTemplateNode: Node = null!;
    @property(Node) moduleDetailsNode: Node = null!;
    @property(Label) moduleTitleLabel: Label = null!;
    @property(Label) selectedCountLabel: Label = null!;
    @property(Node) protocolsContainer: Node = null!;
    @property(Prefab) protocolSelectPrefab: Prefab = null!;

    private _inventoryStore = useInventoryStore();
    private _unwatchSelection: Function | null = null;
    private _unwatchModules: Function | null = null;
    private _renderedModuleKey: string | null = null;
    private _itemViews: Map<string, ProtocolSelectItem> = new Map();

    onEnable() {
        this._unwatchSelection = watch(this._inventoryStore.selectedModule, () => {
            this.render();
        });
        this._unwatchModules = watch(this._inventoryStore.userModules, () => {
            this.render();
        });
        this.render();
    }

    onDisable() {
        if (this._unwatchSelection) {
            this._unwatchSelection();
            this._unwatchSelection = null;
        }
        if (this._unwatchModules) {
            this._unwatchModules();
            this._unwatchModules = null;
        }
        this._renderedModuleKey = null;
    }

    private render() {
        const mod = this._inventoryStore.selectedModule.value;
        const hasSelection = !!mod;

        if (this.emptyTemplateNode) this.emptyTemplateNode.active = !hasSelection;
        if (this.moduleDetailsNode) this.moduleDetailsNode.active = hasSelection;

        if (!mod) {
            if (this.moduleTitleLabel) {
                this.moduleTitleLabel.string = 'СНАРЯЖЕНИЕ';
            }
            this._renderedModuleKey = null;
            return;
        }

        const totalSelected = mod.selectedProtocols?.length || 0;
        const maxProtocols = this._inventoryStore.getMaxProtocols(mod);

        if (this.moduleTitleLabel) {
            this.moduleTitleLabel.string = mod.module.name.toUpperCase();
        }
        if (this.selectedCountLabel) {
            this.selectedCountLabel.string = `ПРОТОКОЛЫ: ${totalSelected} / ${maxProtocols}`;
        }

        const moduleKey = `${mod.id || mod.moduleId}_${mod.isBlueprint}`;
        if (this._renderedModuleKey !== moduleKey) {
            this.rebuildProtocolsList(mod, maxProtocols);
            this._renderedModuleKey = moduleKey;
        } else {
            this.refreshProtocolsControls(mod, maxProtocols);
        }
    }

    private rebuildProtocolsList(mod: UserModule, maxProtocols: number) {
        if (!this.protocolsContainer || !this.protocolSelectPrefab) return;

        this.protocolsContainer.removeAllChildren();
        this._itemViews.clear();

        const unlocked = mod.unlockedProtocols || [];
        const selected = mod.selectedProtocols || [];
        const canAddMore = !mod.isBlueprint && selected.length < maxProtocols;

        unlocked.forEach((protocol) => {
            const itemNode = instantiate(this.protocolSelectPrefab);
            itemNode.parent = this.protocolsContainer;

            const itemComp = itemNode.getComponent(ProtocolSelectItem);
            if (!itemComp) return;

            const count = selected.filter(p => p.id === protocol.id).length;

            itemComp.init(
                protocol,
                count,
                canAddMore,
                (p) => this.handleIncrement(p),
                (p) => this.handleDecrement(p),
            );

            this._itemViews.set(protocol.id, itemComp);
        });
    }

    private refreshProtocolsControls(mod: UserModule, maxProtocols: number) {
        const unlocked = mod.unlockedProtocols || [];
        const selected = mod.selectedProtocols || [];
        const canAddMore = !mod.isBlueprint && selected.length < maxProtocols;

        unlocked.forEach((protocol) => {
            const itemComp = this._itemViews.get(protocol.id);
            if (!itemComp) return;

            const count = selected.filter(p => p.id === protocol.id).length;
            itemComp.updateControls(count, canAddMore);
        });
    }

    private handleIncrement(protocol: ProtocolEnt) {
        const mod = this._inventoryStore.selectedModule.value;
        if (!mod || !mod.id || mod.isBlueprint) return;
        this._inventoryStore.addProtocolToModule(mod.id, protocol);
    }

    private handleDecrement(protocol: ProtocolEnt) {
        const mod = this._inventoryStore.selectedModule.value;
        if (!mod || !mod.id || mod.isBlueprint) return;
        this._inventoryStore.removeProtocolFromModule(mod.id, protocol.id);
    }
}