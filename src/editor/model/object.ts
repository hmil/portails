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


export function computeObjectBoundingBox(sprites: ReadonlyArray<ObjectSprite>): Rectangle {
    let left = 0;
    let top = 0;
    let right = 0;
    let bottom = 0;

    if (sprites.length === 0) {
        return defaultBoundingBox();
    }

    sprites.forEach(sprite => {
        const trsf = sprite.properties.transform;
        if (trsf.x - trsf.scaleX/2 < left) left = trsf.x - trsf.scaleX/2;
        if (trsf.y - trsf.scaleY/2 < top) top = trsf.y - trsf.scaleY/2;
        if (trsf.x + trsf.scaleX/2 > right) right = trsf.x + trsf.scaleX/2;
        if (trsf.y + trsf.scaleY/2 > bottom) bottom = trsf.y + trsf.scaleY/2;
    });

    return { left, top, right, bottom };
}