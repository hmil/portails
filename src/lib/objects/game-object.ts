import { Context } from 'lib/context';
import { EventListener, GameEvent } from 'lib/events';

import { Portalizable } from './portal';

export function isPortalizable(data: unknown): data is Portalizable {
    return typeof data === 'object' && data != null && 'surrogate' in data;
}

export interface ObjectFactory {
    createObject<T extends GameObject<unknown>>(ctr: ObjectConstructor<T>, data: DataOf<T>): T;
}

export abstract class GameObject<TDATA = void> implements ObjectFactory {

    constructor(protected readonly context: Context) {}

    createObject<T extends GameObject<unknown>>(ctr: ObjectConstructor<T>, data: DataOf<T>): T {
        const obj = new ctr(this.context);
        obj.init(data);
        return obj;
    }

    on<T extends GameEvent<any, any>>(type: T['type'], cb: EventListener<T>) {
        this.context.events.on(type, cb);
    }

    init(data: TDATA): void {

    }

}

export type ObjectConstructor<T extends GameObject> = { new(context: Context): T };
export type DataOf<T extends GameObject> = T extends GameObject<infer TDATA> ? TDATA : void;
