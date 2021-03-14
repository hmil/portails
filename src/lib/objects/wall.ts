import { Assets } from "lib/assets";
import { GameObject } from "./game-object";
import * as planck from 'planck-js';
import { PORTAL_PROJECTILE_CATEGORY } from "./projectile";

export class Wall extends GameObject<[number, number, number, number, number?]> {

    public body?: planck.Body;
    public readonly sprite = this;
    public width = 0;
    public height = 0;
    public angle = 0;
    public x = 0;
    public y = 0;

    readonly zIndex = 3;

    public init([x, y, width, height, angle]: [number, number, number, number, number?]) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.angle = angle ?? 0;

        this.createBody(this.context.physics.world);
        // this.context.graphics.addSprite(this);
    }
    
    private createBody(world: planck.World) {
        this.body = world.createBody({
            position: planck.Vec2(this.x + this.width/2, this.y + this.height / 2),
            angle: this.angle
        });

        let box = planck.Box(this.width/2, this.height/2);
        this.body.createFixture({
            shape: box,
            density: 1.0,
            friction: 0.3,
            filterCategoryBits: 0x1 | PORTAL_PROJECTILE_CATEGORY,
        });

        return this.body;
    }

    // public draw(ctx: CanvasRenderingContext2D) {
    //     if (this.body == null) {
    //         return;
    //     }
    //     const pos = this.body.getPosition();
    //     ctx.strokeStyle = '#0ff';
    //     ctx.translate(pos.x, pos.y);
    //     ctx.rotate(this.body.getAngle());
    //     this.context.assets.wallFull.draw(ctx, -this.width / 2, -this.height / 2, this.width, this.height);
    //     // ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
    // }
}