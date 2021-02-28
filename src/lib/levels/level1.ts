import { Box } from 'lib/objects/box';
import { GameObject } from 'lib/objects/game-object';
import { Wall } from 'lib/objects/wall';

export class Level1 extends GameObject {

    public init() {
        this.createObject(Wall, [0, 16, 32, 1]);
        this.createObject(Wall, [32, 0, 1, 16])
        this.createObject(Wall, [0, 0, 32, 1])
        this.createObject(Wall, [0, 0, 1, 16])

        this.createObject(Wall, [5, 10, 1, 1])
        this.createObject(Wall, [6, 10, 1, 1])
        // this.createObject(Wall, [7, 10, 1, 1])
        this.createObject(Wall, [8, 10, 1, 1])
        this.createObject(Wall, [9, 10, 1, 1])
        this.createObject(Wall, [4, 9, 1, 1])
        this.createObject(Wall, [3, 8, 1, 1])
        this.createObject(Wall, [2, 7, 1, 1])
        this.createObject(Wall, [1, 6, 1, 1])
        this.createObject(Wall, [9, 9, 1, 1])
        this.createObject(Wall, [9, 8, 1, 1])
        this.createObject(Wall, [9, 7, 1, 1])
        this.createObject(Wall, [9, 6, 1, 1])

        this.createObject(Wall, [8, 15, 1, 1])
        this.createObject(Wall, [8, 14, 1, 1])
        this.createObject(Wall, [9, 15, 1, 1])
        this.createObject(Wall, [9, 14, 1, 1])

        this.createObject(Wall, [12, 13, 1, 1, Math.PI/4]);
        this.createObject(Wall, [15, 12, 1, 1, 2*Math.PI/6]);

        this.createObject(Box, [12.1, 8]);
    }
}