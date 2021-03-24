import { WritableDraft } from "immer/dist/internal";
import { Transform, ObjectGeometry, Rectangle, transformDefaults, geometryDefaults, Vertex } from "./geometry";
import { ObjectSprite, spriteDefaults } from "./sprite";


export interface WorldObjectProperties {
    name: string;
    transform: Transform;
}
export interface WorldObject {
    properties: WorldObjectProperties;
    guid: string;
    sprites: ReadonlyArray<ObjectSprite>;
    geometries: ReadonlyArray<ObjectGeometry>;
    boundingBox: Rectangle;
}

export function defaultBoundingBox(): Rectangle {
    return { left: -0.5, top: -0.5, right: 0.5, bottom: 0.5 };
}

export function worldObjectDefaults(guid: string): WritableDraft<WorldObject> {
    const draft: WritableDraft<WorldObject> = {
        guid,
        properties: {
            name: 'unnamed',
            transform: transformDefaults(),
        },
        boundingBox: defaultBoundingBox(),
        geometries: [geometryDefaults(guid, 'default')],
        sprites: [spriteDefaults(guid, 'default')]
    };
    draft.boundingBox = computeObjectBoundingBox(draft);
    return draft;
}


export function computeObjectBoundingBox(object: WorldObject): Rectangle {
    let left = 0;
    let top = 0;
    let right = 0;
    let bottom = 0;

    if (object.sprites.length === 0) {
        return defaultBoundingBox();
    }

    object.sprites.forEach(sprite => {
        const trsf = sprite.properties.transform;
        if (trsf.x - trsf.scaleX/2 < left) left = trsf.x - trsf.scaleX/2;
        if (trsf.y - trsf.scaleY/2 < top) top = trsf.y - trsf.scaleY/2;
        if (trsf.x + trsf.scaleX/2 > right) right = trsf.x + trsf.scaleX/2;
        if (trsf.y + trsf.scaleY/2 > bottom) bottom = trsf.y + trsf.scaleY/2;
    });

    object.geometries.forEach(geometry => {
        geometry.vertices.forEach(vert => {
            if (vert.x < left) left = vert.x;
            if (vert.x > right) right = vert.x;
            if (vert.y < top) top = vert.y;
            if (vert.y > bottom) bottom = vert.y;
        });
    })

    return { left, top, right, bottom };
}