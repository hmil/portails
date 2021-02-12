import { Assets } from "lib/assets";
import { Sprite } from "lib/graphics";
import { GameObject } from "./game-object";
import * as planck from 'planck-js';

export class Wall implements GameObject, Sprite {

    public body?: planck.Body;
    public readonly sprite = this;

    constructor(private readonly x: number, private readonly y: number, private width: number, private height: number, private angle: number = 0) {
    }

    public createBody(world: planck.World) {
        this.body = world.createBody({
            position: planck.Vec2(this.x + this.width/2, this.y + this.height / 2),
            angle: this.angle
        });

        let box = planck.Box(this.width/2, this.height/2);
        this.body.createFixture({
            shape: box,
            density: 1.0,
            friction: 0.3
        });

        return this.body;
    }

    public draw(ctx: CanvasRenderingContext2D, assets: Assets) {
        if (this.body == null) {
            return;
        }
        const pos = this.body.getPosition();
        ctx.strokeStyle = '#0ff';
        ctx.translate(pos.x, pos.y);
        ctx.rotate(this.body.getAngle());
        assets.wallFull.draw(ctx, -this.width / 2, -this.height / 2, this.width, this.height);
        // ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
    }
}