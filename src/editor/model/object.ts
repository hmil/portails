import { WritableDraft } from "immer/dist/internal";
import { Transform, ObjectGeometry, Rectangle, transformDefaults } from "./geometry";
import { ObjectSprite, spriteDefaults } from "./sprite";


export interface WorldObjectProperties {
    name: string;
    transform: Transform;
}
export interface WorldObject extends WorldObjectState {
    properties: WorldObjectProperties;
    guid: string;
    sprites: ReadonlyArray<ObjectSprite>;
    geometries: ReadonlyArray<ObjectGeometry>;
    boundingBox: Rectangle;
}

export interface WorldObjectState {
    selected: boolean;
}

export function defaultBoundingBox(): Rectangle {
    return { left: -0.5, top: -0.5, right: 0.5, bottom: 0.5 };
}

export function worldObjectDefaults(guid: string): WritableDraft<WorldObject> {
    return {
        guid,
        properties: {
            name: 'unnamed',
            transform: transformDefaults(),
        },
        boundingBox: defaultBoundingBox(),
        geometries: [],
        sprites: [spriteDefaults(guid, 'default')],
        selected: false
    };
}
