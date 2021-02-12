import { Sprite } from "lib/graphics";
import { Vec2 } from "planck-js";
import { GameObject } from "./game-object";

export class Crosshair implements GameObject {

    public readonly sprite: Sprite = this;
    private x: number = 0;
    private y: number = 0;


    setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    getPosition(): Vec2 {
        return Vec2(this.x, this.y);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = '#fff';
        ctx.fillStyle = '#000';
        ctx.lineWidth = 0.1;
        ctx.beginPath();
        ctx.moveTo(this.x - 0.5, this.y);
        ctx.lineTo(this.x + 0.5, this.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - 0.5);
        ctx.lineTo(this.x, this.y + 0.5);
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(this.x, this.y, .2, .2, 0, 0, 2 * Math.PI);
        ctx.fillStyle = '#fff';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-1, -1);
        ctx.lineTo(-2, -2);
        ctx.fill();
    }
}