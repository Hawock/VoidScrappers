import { assetManager, ImageAsset, Texture2D, SpriteFrame } from 'cc';

export class RemoteImageLoader {
    // Храним готовые спрайты: URL -> SpriteFrame
    private static _cache: Map<string, SpriteFrame> = new Map();
    // Храним текущие загрузки, чтобы не качать одно и то же дважды одновременно
    private static _loadingPromises: Map<string, Promise<SpriteFrame | null>> = new Map();

    public static async loadSprite(imageUrl: string): Promise<SpriteFrame | null> {
        if (!imageUrl) return null;

        // 1. Если уже есть в кэше — отдаем мгновенно
        if (this._cache.has(imageUrl)) {
            return this._cache.get(imageUrl)!;
        }

        // 2. Если эта картинка прямо сейчас качается — ждем ту же загрузку
        if (this._loadingPromises.has(imageUrl)) {
            return this._loadingPromises.get(imageUrl)!;
        }

        // 3. Если ничего нет — создаем новую загрузку
        const loadPromise = new Promise<SpriteFrame | null>((resolve) => {
            assetManager.loadRemote<ImageAsset>(imageUrl, { ext: '.png' }, (err, imageAsset) => {
                if (err) {
                    console.warn(`[RemoteImageLoader] Ошибка: ${imageUrl}`);
                    this._loadingPromises.delete(imageUrl); // Чистим промис при ошибке
                    resolve(null);
                    return;
                }

                const texture = new Texture2D();
                texture.image = imageAsset;
                const spriteFrame = new SpriteFrame();
                spriteFrame.texture = texture;

                // Сохраняем результат в кэш
                this._cache.set(imageUrl, spriteFrame);
                // Убираем из списка активных загрузок
                this._loadingPromises.delete(imageUrl);

                resolve(spriteFrame);
            });
        });

        this._loadingPromises.set(imageUrl, loadPromise);
        return loadPromise;
    }
}