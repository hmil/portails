import {World, Vec2} from 'planck-js';

const simPeriod = 1/60;
const MAX_ITERATIONS = 3;

export class Physics {

    public readonly world: World;

    private rest = 0;

    constructor() {
        this.world = World({
            gravity: Vec2(0.0, 20.0),
        });
    }

    public step(delta: number) {
        this.rest += delta;
        for (let i = 0 ; i < MAX_ITERATIONS && this.rest > simPeriod * 1000 ; i++) {
            this.world.step(simPeriod, 6, 2);
            this.rest -= simPeriod * 1000;
        }
        this.rest = Math.min(MAX_ITERATIONS * simPeriod * 1000, this.rest);
        // this.world.step(1 / 60, 6, 2);
    }
}