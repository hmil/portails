import { mat3 } from "gl-matrix";
import { ImageSprite } from "./assets-loader";

export interface Sprite {
    draw(ctx: CanvasRenderingContext2D): void;
    readonly zIndex?: number;
}

export interface SpriteOptions {
    zIndex: number;
    animationFPS: number;
    oneShot: boolean;
}

export class StandardSprite implements Sprite {

    public zIndex: number;
    public imageSequence: ImageSprite[];
    public animationFPS: number;
    public startTime = Date.now();

    public oneShot: boolean;

    public transform = mat3.identity(mat3.create());

    constructor(public body: planck.Body, sprite: ImageSprite | ImageSprite[], public width: number, public height: number, options?: Partial<SpriteOptions>) {
        this.zIndex = options?.zIndex ?? 0;
        this.imageSequence = Array.isArray(sprite) ? sprite : [sprite];
        this.animationFPS = options?.animationFPS ?? 60;
        this.oneShot = options?.oneShot ?? false;
    }

    public resetAnimation() {
        this.startTime = Date.now();
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const timeFrame = Math.round((Date.now() - this.startTime) * this.animationFPS / 1000);

        const frame = this.oneShot ? Math.min(timeFrame, this.imageSequence.length - 1) : timeFrame % this.imageSequence.length;
        const pos = this.body.getPosition();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(this.body.getAngle());
        ctx.transform(this.transform[0], this.transform[1],this.transform[3],this.transform[4],this.transform[6],this.transform[7]);
        this.imageSequence[frame].draw(ctx, -this.width / 2, -this.height / 2, this.width, this.height);
    }

}