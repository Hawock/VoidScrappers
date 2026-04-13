import { EventTarget } from 'cc';
import { PinaColada } from 'db://assets/shared/infra/PinaColada';
import { IDialog, IDialogWithoutId } from '../types/dialog.types';

export const useDialogs = () => PinaColada.instance.useStore('dialogs', () => {
    let dialogs: IDialog[] = [];
    let currentDialogId = 1;
    
    const events = new EventTarget(); 

    const showDialog = (dialog: IDialogWithoutId) => {
        return new Promise<any>((resolve) => {
            const newDialog = {
                ...dialog,
                id: currentDialogId++,
                isShow: true,
                resolve
            } as IDialog; // Кастим тип на всякий случай
            dialogs.push(newDialog);
            events.emit('add-dialog', newDialog);
        });
    };

    // Асинхронная проверка перед закрытием
    const beforeCloseDialog = async (dialog: IDialog) => {
        if (dialog.beforeClose) return await dialog.beforeClose();
        return true;
    };

    const closeDialog = async (dialogId: number) => {
        const dialog = dialogs.find(d => d.id === dialogId);
        if (!dialog) return;

        // Если beforeClose вернет false, отменяем закрытие
        if (!(await beforeCloseDialog(dialog))) return;

        dialogs = dialogs.filter(d => d.id !== dialogId);
        events.emit('remove-dialog', dialogId);
    };

    const confirm = async (dialog: IDialog, eventData: any = true) => {
        if (dialog.beforeComfirm) await dialog.beforeComfirm(eventData);
        if (dialog.resolve) dialog.resolve(eventData);
        closeDialog(dialog.id);
    };

    const reject = (dialog: IDialog) => {
        if (dialog.resolve) dialog.resolve(false);
        closeDialog(dialog.id);
    };

    const closeAllDialogs = () => {
        // Тут осторожнее: closeDialog теперь async, но для массового закрытия сойдет
        dialogs.forEach(d => closeDialog(d.id));
    };

    return {
        get dialogs() { return dialogs; }, 
        events, 
        showDialog,
        closeDialog,
        confirm,
        reject,
        closeAllDialogs
    };
});