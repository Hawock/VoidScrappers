import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('InventorySlot')
export class InventorySlot extends Component {
    @property(Node) moduleAnchor: Node = null!;

    public get isFilled(): boolean {
        return this.moduleAnchor.children.length > 0;
    }

    public addModule(moduleNode: Node) {
        if (this.isFilled) return;
        moduleNode.parent = this.moduleAnchor;
        moduleNode.setPosition(0, 0, 0);
    }

    public clear() {
        this.moduleAnchor.removeAllChildren();
    }
}