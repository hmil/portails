import { StandardSprite } from 'lib/sprite';
import * as planck from 'planck-js';

import { GameObject } from './game-object';
import { initPortalSurrogate, Portalizable } from './portal';

export class Box extends GameObject<[number, number]> implements Portalizable {

    public portalSurrogate = initPortalSurrogate();

    public width = 1;
    public height = 1;
    public angle = 0;
    public x = 0;
    public y = 0;
    public body: planck.Body = this.createBody();

    readonly zIndex = 2;

    public sprite = new StandardSprite(this.body, this.context.assets.wallFull, 1, 1, { zIndex: 2 });

    public init([x, y]: [number, number]) {
        this.x = x;
        this.y = y;

        this.body.setPosition(planck.Vec2(this.x + this.width/2, this.y + this.height / 2));
        this.context.graphics.addSprite(this.sprite);
    }
    
    public createBody() {
        const world = this.context.physics.world;
        this.body = world.createBody({
            type: 'dynamic',
            position: planck.Vec2(this.x + this.width/2, this.y + this.height / 2),
            angle: this.angle,
            userData: this,
        });

        let box = planck.Box(this.width/2, this.height/2);
        this.body.createFixture({
            shape: box,
            density: 0.6,
            friction: 0.6
        });

        return this.body;
    }
}