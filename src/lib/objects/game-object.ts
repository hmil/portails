import { Sprite } from 'lib/graphics';

export interface GameObject {
    sprite: Sprite;
    createBody?(world: planck.World): planck.Body;
}