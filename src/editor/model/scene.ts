import { WorldObject } from './object';

export interface Scene {
    objects: ReadonlyArray<WorldObject>;
}