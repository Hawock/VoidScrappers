import { _decorator, Component, Label, Node, instantiate, Prefab, tween, Vec3, UIOpacity, Button, UITransform } from 'cc';
import { IDialog } from '../types/dialog.types';
import { useDialogs } from './dialog.store';
import { ButtonTypeEnum, ButtonOptions, AppButton } from '../../app-button';

const { ccclass, property } = _decorator;

@ccclass('AppDialog')
export class AppDialog extends Component {
    @property(Label) titleLabel: Label = null!;
    @property(Label) descriptionLabel: Label = null!;
    @property(Node) contentContainer: Node = null!;
    @property(Node) defaultContainer: Node = null!;

    @property(Button) btnCloseX: Button = null!;

    @property(Prefab) buttonPrefab: Prefab = null!;
    @property(Node) buttonsContainer: Node = null!;

    // --- НОВОЕ: Ссылка на саму плашку окна для изменения размеров ---
    @property(Node) dialogWindow: Node = null!; 

    private config: IDialog = null!;
    
    // Переменные для хранения дефолтных размеров
    private defaultWidth: number = 0;
    private defaultHeight: number = 0;

    protected onLoad() {
        // Запоминаем оригинальные размеры окна при первой загрузке
        if (this.dialogWindow) {
            const transform = this.dialogWindow.getComponent(UITransform);
            if (transform) {
                this.defaultWidth = transform.width;
                this.defaultHeight = transform.height;
            }
        }
    }

    public setup(config: IDialog) {
        this.config = config;

        // --- НОВОЕ: Применяем кастомные настройки окна (размеры и т.д.) ---
        this.applyDialogOptions(config.dialogOptions);

        // 1. Настраиваем заголовок
        if (this.titleLabel) {
            this.titleLabel.node.active = !!config.header;
            this.titleLabel.string = config.header || '';
        }

        // 2. Подписываемся на глобальный крестик "Закрыть"
        if (this.btnCloseX) {
            this.btnCloseX.node.off(Button.EventType.CLICK);
            this.btnCloseX.node.on(Button.EventType.CLICK, this.onCloseXClick, this);
        }

        // 3. Разделяем логику отрисовки
        if (config.component) {
            this.setupCustomContent(config);
        } else {
            this.setupStandardContent(config);
        }
        this.playOpenAnimation();
    }

    // --- НОВЫЙ МЕТОД ---
    private applyDialogOptions(options?: Record<string, any>) {
        if (!this.dialogWindow) return;

        const transform = this.dialogWindow.getComponent(UITransform);
        if (!transform) return;

        // Если передали кастомную ширину — ставим её, иначе возвращаем дефолтную
        transform.width = options?.width !== undefined 
            ? options.width 
            : this.defaultWidth;

        // Если передали кастомную высоту — ставим её, иначе возвращаем дефолтную
        transform.height = options?.height !== undefined 
            ? options.height 
            : this.defaultHeight;
    }

    private playOpenAnimation() {
        const visualNode = this.node.getChildByName('Visual');
        const overlayNode = this.node.getChildByName('Overlay');

        // 1. Анимируем само окно (выпрыгивание с эффектом backOut)
        if (visualNode) {
            // Задаем стартовые значения (маленький размер, нулевая прозрачность)
            visualNode.scale = new Vec3(0.5, 0.5, 1);
            let uiOpacity = visualNode.getComponent(UIOpacity) || visualNode.addComponent(UIOpacity);
            uiOpacity.opacity = 0;

            // Плавное увеличение с "пружинкой"
            tween(visualNode)
                .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
                .start();

            // Плавное появление (fade in)
            tween(uiOpacity)
                .to(0.2, { opacity: 255 })
                .start();
        }

        // 2. Анимируем затемнение фона (просто плавное появление)
        if (overlayNode) {
            let uiOpacity = overlayNode.getComponent(UIOpacity) || overlayNode.addComponent(UIOpacity);
            uiOpacity.opacity = 0;
            tween(uiOpacity)
                .to(0.3, { opacity: 255 })
                .start();
        }
    }

    // Возвращаем Promise, чтобы DialogWidget подождал завершения анимации перед удалением ноды!
    public playCloseAnimation(): Promise<void> {
        return new Promise((resolve) => {
            const visualNode = this.node.getChildByName('Visual');
            const overlayNode = this.node.getChildByName('Overlay');

            if (!visualNode) {
                resolve();
                return;
            }

            let uiOpacity = visualNode.getComponent(UIOpacity) || visualNode.addComponent(UIOpacity);

            // Анимация исчезновения окна (уменьшение и растворение)
            tween(visualNode)
                .to(0.2, { scale: new Vec3(0.8, 0.8, 1) }, { easing: 'backIn' })
                .start();

            tween(uiOpacity)
                .to(0.2, { opacity: 0 })
                .call(() => resolve()) // Как только анимация закончится, разрешаем Promise
                .start();

            // Плавно убираем фон
            if (overlayNode) {
                let overlayOpacity = overlayNode.getComponent(UIOpacity) || overlayNode.addComponent(UIOpacity);
                tween(overlayOpacity).to(0.2, { opacity: 0 }).start();
            }
        });
    }

    private setupCustomContent(config: IDialog) {
        // Отключаем стандартный UI
        this.defaultContainer.active = false;

        // Включаем контейнер
        this.contentContainer.active = true;

        // Создаем ноду из переданного префаба
        const customNode = instantiate(config.component as Prefab);

        // --- ПОДПИСКА НА СОБЫТИЯ ИЗ ВНУТРЕННЕГО ПРЕФАБА ---

        // Ловим emit('close') от дочернего элемента
        customNode.on('close', () => {
            this.onCloseXClick();
        });

        // Ловим emit('confirm', data) от дочернего элемента
        customNode.on('confirm', (eventData: any) => {
            useDialogs().confirm(this.config, eventData);
        });

        // Передаем props, если у внутреннего префаба есть метод setupProps
        const customScript = customNode.getComponent(customNode.name) as any;
        if (customScript && customScript.setupProps) {
            customScript.setupProps(config.props);
        }

        // Добавляем внутрь нашего окна
        this.contentContainer.addChild(customNode);
    }

    private setupStandardContent(config: IDialog) {
         this.defaultContainer.active = true;
        // Отключаем контейнер префабов
        this.contentContainer.active = false;

        // Описание
        if (this.descriptionLabel) {
            this.descriptionLabel.node.active = !!config.text;
            this.descriptionLabel.string = config.text || '';
        }

        // --- ГЕНЕРАЦИЯ КНОПОК ---

        // Очищаем контейнер от кнопок прошлого вызова
        this.buttonsContainer.removeAllChildren();

        if (config.isConfirm) {
            // Если это окно Confirm (ДА/НЕТ)

            // Кнопка "НЕТ" (Второстепенная, рисуем первой, чтобы была слева)
            if (!config.withoutRejectBtn) {
                this.spawnButton(
                    { text: config.rejectBtnText || "НЕТ", type: ButtonTypeEnum.SECONDARY },
                    this.onRejectClick
                );
            }

            // Кнопка "ДА" (Главная)
            this.spawnButton(
                { text: config.confirmBtnText || "ДА", type: ButtonTypeEnum.PRIMARY },
                this.onConfirmClick
            );
        } else {
            // Если это обычный Alert (Только ОК)
            this.spawnButton(
                { text: config.confirmBtnText || "ОК", type: ButtonTypeEnum.PRIMARY },
                this.onConfirmClick
            );
        }
    }

    // Вспомогательный метод для инстанса и настройки кнопки
    private spawnButton(opts: ButtonOptions, callback: Function) {
        if (!this.buttonPrefab || !this.buttonsContainer) return;

        const btnNode = instantiate(this.buttonPrefab);
        this.buttonsContainer.addChild(btnNode);

        const appButton = btnNode.getComponent(AppButton);
        if (appButton) {
            appButton.setup(opts);
        }

        // Вешаем слушатель клика Кокоса прямо на ноду кнопки
        btnNode.on(Button.EventType.CLICK, callback, this);
    }

    // --- ОБРАБОТЧИКИ КЛИКОВ ---
    private onConfirmClick() {
        useDialogs().confirm(this.config);
    }

    private onRejectClick() {
        useDialogs().reject(this.config);
    }

    private onCloseXClick() {
        useDialogs().reject(this.config);
    }
}