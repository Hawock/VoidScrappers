import { _decorator, Component, Prefab, instantiate, Node, director } from 'cc';
import { IDialog } from '../types/dialog.types';
import { useDialogs } from './dialog.store';
import { AppDialog } from './app.dialog';


const { ccclass, property } = _decorator;

@ccclass('DialogWidget')
export class DialogWidget extends Component {
    @property(Prefab) 
    dialogPrefab: Prefab = null!;

    private dialogNodes: Map<number, Node> = new Map();

    onLoad() {
        // Делаем этот Canvas бессмертным при переходе между сценами!
        // Важно: нода должна быть в самом корне иерархии сцены.
        director.addPersistRootNode(this.node);
    }

    protected start(): void {
        const store = useDialogs();
        store.events.on('add-dialog', this.onAddDialog, this);
        store.events.on('remove-dialog', this.onRemoveDialog, this);
    }

    onEnable() {
        
    }

    onDisable() {
        // onDisable может сработать, если мы вручную выключим ноду, 
        // но при смене сцены она теперь не будет уничтожаться.
        
    }

    protected onDestroy(): void {
        const store = useDialogs();
        store.events.off('add-dialog', this.onAddDialog, this);
        store.events.off('remove-dialog', this.onRemoveDialog, this);
    }

    private onAddDialog(dialogConfig: IDialog) {
        console.log("👂 [DialogWidget] Поймал событие! Пытаюсь создать окно...", dialogConfig);
        
        const dialogNode = instantiate(this.dialogPrefab);
        
        // --- ИСПРАВЛЕНИЕ ЗДЕСЬ ---
        // Ищем ноду Canvas внутри нашего GlobalDialogCanvas и добавляем окно в неё
        const uiCanvas = this.node.getChildByName('Canvas');
        if (uiCanvas) {
            uiCanvas.addChild(dialogNode);
        } else {
            this.node.addChild(dialogNode); // Фолбэк на всякий случай
        }
        // -------------------------

        this.dialogNodes.set(dialogConfig.id, dialogNode);

        const comp = dialogNode.getComponent(AppDialog);
        if (comp) {
            comp.setup(dialogConfig);
        }
    }

    private async onRemoveDialog(dialogId: number) {
        const node = this.dialogNodes.get(dialogId);
        if (node) {
            const comp = node.getComponent(AppDialog);
            if (comp) {
                // ЖДЕМ завершения красивой анимации закрытия!
                await comp.playCloseAnimation(); 
            }
            
            // И только когда промис вернул resolve(), уничтожаем ноду
            node.destroy();
            this.dialogNodes.delete(dialogId);
        }
    }
}