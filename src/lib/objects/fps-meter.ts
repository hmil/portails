import { Sprite } from 'lib/graphics/sprite';

import { GameObject } from './game-object';

export class FpsMeter extends GameObject implements Sprite {

    private lastTime = 0;
    private delta = 1;

    draw(gl: WebGLRenderingContext): void {
        // ctx.resetTransform();
        // ctx.fillStyle = '#f00';
        // ctx.font = '50px sans-serif';
        // ctx.fillText(`Fps: ${Math.round(1000 / this.delta)}`, 10, 80);
    }

    zIndex = 4;

    init() {
        this.context.graphics.addSprite(this);
        this.on('before-physics', () => {
            this.update(performance.now());
        });
    }

    update = (time: number) => {
        this.delta = (this.delta * 9 + time - this.lastTime) / 10;
        this.lastTime = time;
    }
}