import { Assets } from 'lib/assets';
import * as planck from 'planck-js';

import { GameObject } from './game-object';
import { Portalizable } from './portal';

export class Box extends GameObject<[number, number]> implements Portalizable {


    public body?: planck.Body;
    public readonly sprite = this;
    public width = 1;
    public height = 1;
    public angle = 0;
    public x = 0;
    public y = 0;


    public surrogate = {
        sprite: {
            zIndex: 2,
            draw: (ctx: CanvasRenderingContext2D, assets: Assets) => {
                const pos = this.surrogate.body.getPosition();
                ctx.strokeStyle = '#0ff';
                ctx.translate(pos.x, pos.y);
                ctx.rotate(this.surrogate.body.getAngle());
                assets.wallFull.draw(ctx, -this.width / 2, -this.height / 2, this.width, this.height);
            }
        },
        body: this.context.physics.world.createBody({
            type: 'static',
            position: planck.Vec2(this.x + this.width/2, this.y + this.height / 2),
            angle: this.angle,
            userData: this
        }),
        active: 0
    };

    readonly zIndex = 3;

    public init([x, y]: [number, number]) {
        this.x = x;
        this.y = y;

        this.createBody(this.context.physics.world);
        this.context.graphics.addSprite(this);
        this.context.graphics.addSprite(this.surrogate.sprite);
    }
    
    private createBody(world: planck.World) {
        this.body = world.createBody({
            type: 'dynamic',
            position: planck.Vec2(this.x + this.width/2, this.y + this.height / 2),
            angle: this.angle,
            userData: this
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