
export interface AssetImage {
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface ImageSprite {
    draw(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void;
}

export function image(src: string, x: number, y: number, width: number, height: number): AssetImage {
    return {src, x, y, width, height};
}

type LoadedAsset<T> = T extends AssetImage ? ImageSprite : never;
export type LoadedAssets<T> = {
    [k in keyof T]: LoadedAsset<T[k]>;
}

type Library = {[k: string]: AssetImage};

function makeImageSprite(image: HTMLImageElement, asset: AssetImage): ImageSprite {
    return {
        draw(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
            ctx.drawImage(image, asset.x, asset.y, asset.width, asset.height, x, y, width, height)
        }
    }
}

export class AssetsLoader {

    private images: Map<string, Promise<HTMLImageElement>> = new Map();

    public async load<T extends Library>(library: T): Promise<LoadedAssets<T>> {
        const loaded = await Promise.all(Object.keys(library)
        .map(k => [
            k, library[k]
        ] as const)
        .map(([k, v]) => this.loadImage(v.src).then(img => [k, img, v] as const)));

        return loaded.reduce((acc, [k, image, sprite]) => {
            acc[k] = makeImageSprite(image, sprite);
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