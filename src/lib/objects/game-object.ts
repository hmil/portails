import { Graphics } from 'lib/graphics';
import { Sprite } from 'lib/sprite';


export interface Portalizable {
    surrogate: {
        sprite: Sprite;
        body: planck.Body;
        active: boolean;
    }
}

export interface ObjectFactory {
    createObject<T extends GameObject<unknown>>(ctr: ObjectConstructor<T>, data: DataOf<T>): T;
}

export abstract class GameObject<TDATA = void> implements ObjectFactory {

    constructor(protected readonly world: planck.World, protected readonly graphics: Graphics) {}

    createObject<T extends GameObject<unknown>>(ctr: ObjectConstructor<T>, data: DataOf<T>): T {
        const obj = new ctr(this.world, this.graphics);
        obj.init(data);
        return obj;
    }

    init(data: TDATA): void {

    }

}

export type ObjectConstructor<T extends GameObject> = { new(world: planck.World, graphics: Graphics): T };
export type DataOf<T extends GameObject> = T extends GameObject<infer TDATA> ? TDATA : never;
