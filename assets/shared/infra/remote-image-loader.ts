import { assetManager, ImageAsset, Texture2D, SpriteFrame } from 'cc';

export class RemoteImageLoader {
    /**
     * Загружает картинку по точной ссылке и возвращает готовый SpriteFrame.
     */
    public static loadSprite(imageUrl: string): Promise<SpriteFrame | null> {
        return new Promise((resolve) => {
            if (!imageUrl) {
                resolve(null);
                return;
            }

            assetManager.loadRemote<ImageAsset>(imageUrl, { ext: '.png' }, (err, imageAsset) => {
                if (err) {
                    console.warn(`[RemoteImageLoader] Ошибка загрузки картинки: ${imageUrl}`);
                    resolve(null);
                    return;
                }

                const texture = new Texture2D();
                texture.image = imageAsset;
                const spriteFrame = new SpriteFrame();
                spriteFrame.texture = texture;

                resolve(spriteFrame);
            });
        });
    }
}