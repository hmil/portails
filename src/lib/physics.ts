import {World, Vec2} from 'planck-js';

export class Physics {

    public readonly world: World;

    constructor() {
        this.world = World({
            gravity: Vec2(0.0, 20.0),
        });
    }

    public step(_delta: number) {
        this.world.step(1/60, 6, 2);
    }
}