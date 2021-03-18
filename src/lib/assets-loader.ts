
export interface AssetImage {
    src: string;
}

export interface ImageFrame {
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface ImageSprite {
    imageData: TexImageSource;
    frames: ReadonlyArray<ImageFrame>;
}

export function image(src: string): AssetImage {
    return {src};
}

type LoadedAsset<T> = T extends AssetImage ? TexImageSource : never;
export type LoadedAssets<T> = {
    [k in keyof T]: LoadedAsset<T[k]>;
}

type Library = {[k: string]: AssetImage};

export class AssetsLoader {

    private images: Map<string, Promise<HTMLImageElement>> = new Map();

    public async load<T extends Library>(library: T): Promise<LoadedAssets<T>> {
        const loaded = await Promise.all(Object.keys(library)
        .map(k => [
            k, library[k]
        ] as const)
        .map(([k, v]) => this.loadImage(v.src).then(img => [k, img, v] as const)));

        return loaded.reduce((acc, [k, image, sprite]) => {
            acc[k] = image;
            return acc;
        }, {} as any)
    }

    private loadImage(src: string): Promise<HTMLImageElement> {
        const cached = this.images.get(src);
        if (cached) {
            return cached;
        }

        const p = new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve(img);
            }
            img.onerror = reject;
            img.src = src;
        });
        this.images.set(src, p);
        return p;
    }
}