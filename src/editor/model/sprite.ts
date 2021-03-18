import { Transform, transformDefaults } from "./geometry";

export interface ObjectSpriteProperties {
    src: string;
    transform: Transform;
    name: string;
}

export interface ObjectSprite {
    spriteId: string;
    ownerId: string;
    selected: boolean;
    properties: ObjectSpriteProperties;
}

export function spriteDefaults(ownerId: string, spriteId: string): ObjectSprite {
    return {
        ownerId, spriteId,
        selected: true,
        properties: {
            src: '/static/tiles-pack-1/Tile (1).png',
            name: 'unnamed',
            transform: transformDefaults()
        }
    }
}
