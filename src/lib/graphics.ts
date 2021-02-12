import { Assets } from "./assets";

export const SCREEN_WIDTH = 32;
export const SCREEN_HEIGHT = 18;


export interface Sprite {
    draw(ctx: CanvasRenderingContext2D, assets: Assets): void;
}

export class Graphics {

    public readonly ctx: CanvasRenderingContext2D;
    private readonly el: HTMLCanvasElement;

    private scalingFactor = 1;
    private offsetX = 0;
    private offsetY = 0;
    private width = 0;
    private height = 0;
    private pixelRatio = 1;

    private sprites: Sprite[] = [];

    constructor(private readonly assets: Assets) {
        this.el = document.createElement('canvas');
        this.el.addEventListener('contextmenu', event => event.preventDefault());
        this.el.style.width = '100%';
        this.el.style.height = '100%';
        const ctx = this.el.getContext('2d');
        if (ctx == null) {
            throw new Error('Canvas not supported in this browser');
        }
        this.ctx = ctx;
        document.body.append(this.el);
        this.layout();
        window.addEventListener('resize', () => this.layout());
    }

    public addSprite(sprite: Sprite): void {
        this.sprites.push(sprite);
    }

    public mapToWorldCoordinates(clientX: number, clientY: number) {
        return [
            ((clientX * this.pixelRatio - this.offsetX) / this.scalingFactor),
            ((clientY * this.pixelRatio - this.offsetY) / this.scalingFactor),
        ];
    }

    public draw(): void {
        this.ctx.resetTransform();
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.translate(this.offsetX, this.offsetY);
        this.ctx.scale(this.scalingFactor, this.scalingFactor);
        this.ctx.strokeStyle = '#fff';
        this.ctx.strokeRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        for (const sprite of this.sprites) {
            this.ctx.save();
            sprite.draw(this.ctx, this.assets);
            this.ctx.restore();
        }
    }

    private layout(): void {
        this.pixelRatio = window.devicePixelRatio;
        const canvasSize = this.el.getBoundingClientRect();
        this.width = this.el.width = canvasSize.width * this.pixelRatio;
        this.height = this.el.height = canvasSize.height * this.pixelRatio;

        const ratioX = this.width / SCREEN_WIDTH;
        const ratioY = this.height / SCREEN_HEIGHT;

        if (ratioX < ratioY) {
            this.scalingFactor = ratioX;
            this.offsetX = 0;
            this.offsetY = (this.height - SCREEN_HEIGHT * ratioX) / 2;
        } else {
            this.scalingFactor = ratioY;
            this.offsetX = (this.width - SCREEN_WIDTH * ratioY) / 2;
            this.offsetY = 0;
        }
        console.log(this.scalingFactor);
    }
}