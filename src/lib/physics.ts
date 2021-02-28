import {World, Vec2} from 'planck-js';

const simFreq = 1/60;
const MAX_ITERATIONS = 4;

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
        for (let i = 0 ; i < MAX_ITERATIONS && this.rest > simFreq * 1000 ; i++) {
            this.world.step(simFreq, 6, 2);
            this.rest -= simFreq * 1000;
        }
        // this.world.step(1 / 60, 6, 2);
    }
}