import { Prefab } from 'cc';

// Аналог ButtonType из Vant. 
// В AppDialog.ts ты сможешь читать этот тип и менять SpriteFrame у кнопки
export type AppButtonType = 'primary' | 'secondary' | 'danger' | 'warning' | 'default';

export interface IDialogOptions {
    width?: number;
    height?: number;
    // Оставляем возможность прокидывать любые другие параметры на будущее
    [key: string]: any; 
}

export interface IDialogWithoutId {
  id?: number;
  isShow?: boolean;
  text?: string;
  header?: string;
  
  // Кнопки и логика подтверждения
  isConfirm?: boolean; 
  confirmBtnText?: string; 
  rejectBtnText?: string; 
  withoutRejectBtn?: boolean; 
  
  // Визуал кнопок
  confirmBtnType?: AppButtonType; 
  rejectBtnType?: AppButtonType;  
  isConfirmBtnPlain?: boolean;    
  isRejectBtnPlain?: boolean;     
  horizontalBtns?: boolean;
  
  component?: Prefab; 
  props?: any; 
  
  dialogOptions?: IDialogOptions; 
  
  // Коллбеки
  exceptionCallback?: (error?: any) => void; 
  beforeClose?: () => boolean | Promise<boolean>; 
  beforeComfirm?: (event?: any) => void; 
}

export interface IDialog extends IDialogWithoutId {
  id: number;
  isShow: boolean; // В сторе мы точно будем знать, что окно вызвано
  resolve?: (value: boolean | any) => void;
}