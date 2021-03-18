import { rigidBodyTransform } from 'lib/glutils';
import { StandardSprite } from 'lib/graphics/standard-sprite';
import * as planck from 'planck-js';

import { GameObject } from './game-object';
import { initPortalSurrogate, Portalizable } from './portal';

export class Barrel extends GameObject<[number, number]> implements Portalizable {

    public portalSurrogate = initPortalSurrogate();

    public width = 0.69 * 1.2;
    public height = 0.93 * 1.2;
    public angle = 0;
    public x = 0;
    public y = 0;
    public body: planck.Body = this.createBody();

    readonly zIndex = 2;

    public sprite = new StandardSprite(this.context.graphics, this.context.assets.barrel, this.width, this.height, [{
        x: 0, y: 0, w: 177, h: 238
    }], { zIndex: 2 });

    public init([x, y]: [number, number]) {
        this.x = x;
        this.y = y;

        this.body.setPosition(planck.Vec2(this.x + this.width/2, this.y + this.height / 2));
        this.context.graphics.addSprite(this.sprite);
        this.on('after-physics', this.trackView);
    }

    private trackView = () => {
        rigidBodyTransform(this.sprite.modelTransform, this.body);
    }
    
    public createBody() {
        const world = this.context.physics.world;
        const body = world.createBody({
            type: 'dynamic',
            position: planck.Vec2(this.x + this.width/2, this.y + this.height / 2),
            angle: this.angle,
            userData: this,
        });

        let box = planck.Box(this.width/2, this.height/2);
        body.createFixture({
            shape: box,
            density: 0.8,
            friction: 0.6
        });

        return body;
    }
}