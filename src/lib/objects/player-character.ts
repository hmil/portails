import { Assets } from 'lib/assets';
import { Sprite } from 'lib/graphics';
import * as planck from 'planck-js';

import { GameObject } from './game-object';

// const RADIUS = 50;

const HEIGHT = 1.6;
const WIDTH = 0.8;

export class PlayerCharacter implements GameObject, Sprite {

    public body?: planck.Body;
    public readonly sprite: Sprite = this;

    private direction: 'left' | 'right' = 'left';

    constructor() {
    }

    createBody(world: planck.World): planck.Body {
        this.body = world.createBody({
            type: 'dynamic',
            position: planck.Vec2(4, 14),
            allowSleep: false,
            angle: 0,
            fixedRotation: true
        });

        let box = planck.Box(WIDTH / 2, HEIGHT / 2);
        this.body.createFixture({
            shape: box,
            density: 1.0,
            friction: 0.3
        });

        return this.body;
    }

    setDirection(direction: 'left' | 'right') {
        this.direction = direction;
    }

    draw(ctx: CanvasRenderingContext2D, assets: Assets) {
        if (this.body == null) {
            return;
        }

        // ctx.fillStyle = '#f00';
        // for (let ce = this.body.getContactList(); ce != null; ce = ce.next ?? null) {
        //     const c = ce.contact;
        //     for (const point of c.getWorldManifold(null)?.points ?? []) {
        //         ctx.fillRect(point.x - 0.05, point.y - 0.05, 0.1, 0.1);
        //     }
        // }

        const position = this.body.getPosition();
        ctx.strokeStyle = '#f00';
        ctx.fillStyle = '#fff';
        ctx.translate(position.x, position.y);
        ctx.rotate(this.body.getAngle());
        // ctx.beginPath();
        // ctx.moveTo(0, 0);
        // ctx.lineTo(RADIUS, 0);
        // ctx.arc(0, 0, RADIUS, 0, PI2);

        if (this.direction === 'left') {
            ctx.scale(-1, 1);
        }
        assets.character.draw(ctx, -WIDTH / 2, -HEIGHT / 2, WIDTH, HEIGHT);
        ctx.stroke();
    }
}