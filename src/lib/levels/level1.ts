import { Wall } from "lib/objects/wall";
import { GameWorld } from "lib/game-world";

export class Level1 {

    constructor(private readonly world: GameWorld) {

    }

    public init() {
        this.world.addObject(new Wall(0, 16, 32, 1));
        this.world.addObject(new Wall(32, 0, 1, 16));
        this.world.addObject(new Wall(0, 0, 32, 1));
        this.world.addObject(new Wall(0, 0, 1, 16));

        this.world.addObject(new Wall(5, 10, 1, 1));
        this.world.addObject(new Wall(6, 10, 1, 1));
        // this.world.addObject(new Wall(7, 10, 1, 1));
        this.world.addObject(new Wall(8, 10, 1, 1));
        this.world.addObject(new Wall(9, 10, 1, 1));
        this.world.addObject(new Wall(4, 9, 1, 1));
        this.world.addObject(new Wall(3, 8, 1, 1));
        this.world.addObject(new Wall(2, 7, 1, 1));
        this.world.addObject(new Wall(1, 6, 1, 1));
        this.world.addObject(new Wall(9, 9, 1, 1));
        this.world.addObject(new Wall(9, 8, 1, 1));
        this.world.addObject(new Wall(9, 7, 1, 1));
        this.world.addObject(new Wall(9, 6, 1, 1));

        this.world.addObject(new Wall(8, 15, 1, 1));
        this.world.addObject(new Wall(8, 14, 1, 1));

        this.world.addObject(new Wall(10, 13, 1, 1, Math.PI/4));
        this.world.addObject(new Wall(15, 12, 1, 1, 2*Math.PI/6));
    }
}