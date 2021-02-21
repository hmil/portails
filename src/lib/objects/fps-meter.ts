import { Sprite } from 'lib/sprite';

import { GameObject } from './game-object';

export class FpsMeter extends GameObject implements Sprite {

    private lastTime = 0;
    private delta = 1;

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.resetTransform();
        ctx.fillStyle = '#f00';
        ctx.font = '50px sans-serif';
        ctx.fillText(`Fps: ${Math.round(1000 / this.delta)}`, 10, 80);
    }

    zIndex = 4;

    init() {
        this.graphics.addSprite(this);
        requestAnimationFrame(this.update);
    }

    update = (time: number) => {
        this.delta = (this.delta * 9 + time - this.lastTime) / 10;
        this.lastTime = time;
        requestAnimationFrame(this.update);
    }
}