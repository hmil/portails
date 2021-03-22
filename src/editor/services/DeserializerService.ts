import { PortailsObject, PortailsScene, PortailsSprite, PortailsTransform } from 'editor/model/dto';
import { Transform } from 'editor/model/geometry';
import { computeObjectBoundingBox, WorldObject } from 'editor/model/object';
import { Scene } from 'editor/model/scene';
import { ObjectSprite } from 'editor/model/sprite';
import { uniqId } from 'editor/utils/uid';
import { WritableDraft } from 'immer/dist/internal';

export class DeserializerService {

    deserialize(data: string): Scene {
        const parsed: unknown = JSON.parse(data);
        const validation = PortailsScene.validate(parsed);
        if (!validation.success) {
            throw new Error(validation.message);
        }
        return this.hydrate(validation.value);
    }


    private hydrate(scene: PortailsScene): Scene {
        return {
            objects: scene.objects.map(this.hydrateObject)
        }
    }

    private hydrateObject = (object: PortailsObject): WorldObject => {
        const guid = String(uniqId());
        const sprites = object.sprites.map((s) => this.hydrateSprite(guid, s));
        return {
            geometries: [],
            guid,
            properties: {
                name: object.name,
                transform: this.hydrateTransform(object.transform)
            },
            sprites,
            boundingBox: computeObjectBoundingBox(sprites),
            selected: false
        };
    }

    private hydrateTransform(transform: PortailsTransform): Transform {
        return { rotation: transform.a, x: transform.x, y: transform.y, scaleX: transform.sX, scaleY: transform.sY };
    }

    private hydrateSprite(ownerId: string, sprite: PortailsSprite): ObjectSprite {
        const spriteId = String(uniqId());
        return {
            ownerId,
            properties: {
                name: sprite.name,
                src: sprite.src,
                transform: this.hydrateTransform(sprite.transform)
            },
            spriteId,
            selected: false
        }
    }
}