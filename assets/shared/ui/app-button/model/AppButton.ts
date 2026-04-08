import { _decorator, Component, Label, Button, SpriteAtlas, SpriteFrame, Enum } from 'cc';
import { ButtonOptions } from '../types/button-options';
import { ButtonTypeEnum } from '../types/button.enum';
const { ccclass, property } = _decorator;

Enum(ButtonTypeEnum);
@ccclass('AppButton')
export class AppButton extends Component {
    @property(Label) 
    label: Label = null!;

    // Теперь здесь только ОДИН слот — для нашего атласа!
    @property(SpriteAtlas)
    buttonAtlas: SpriteAtlas = null!;

    @property({ group: 'Default Settings' })
    defaultText: string = 'BUTTON';

    @property({ type: ButtonTypeEnum, group: 'Default Settings' })
    defaultType: ButtonTypeEnum = ButtonTypeEnum.PRIMARY;

    onLoad() {
        this.setup({ 
            text: this.defaultText, 
            type: this.defaultType
        });
    }

    public get btnComponent(): Button | null {
        return this.node.getComponent(Button);
    }

    public setup(buttonOpts: ButtonOptions) {
        this.label.string = buttonOpts.text || "";
        if (this.btnComponent && this.buttonAtlas) {
            // Атлас сам умеет отдавать картинки по их оригинальному названию
            this.btnComponent.normalSprite = this.getFrameByName(`${buttonOpts.type}_default`);
            this.btnComponent.hoverSprite = this.getFrameByName(`${buttonOpts.type}_hover`);
            this.btnComponent.pressedSprite = this.getFrameByName(`${buttonOpts.type}_clicked`); 
            this.btnComponent.disabledSprite = this.getFrameByName(`${buttonOpts.type}_disabled`);
        }
    }

    public setInteractable(isInteractable: boolean) {
        if (this.btnComponent) {
            this.btnComponent.interactable = isInteractable;
        }
    }

    // Вспомогательный метод для безопасного извлечения из атласа
    private getFrameByName(spriteName: string): SpriteFrame | null {
        if (!this.buttonAtlas) return null;
        
        // Магия Кокоса: ищем внутри .plist
        const frame = this.buttonAtlas.getSpriteFrame(spriteName);
        
        if (!frame) {
            console.warn(`[AppButton] Ошибка: Спрайт "${spriteName}" не найден в атласе! Проверь названия внутри .plist.`);
        }
        return frame;
    }
}