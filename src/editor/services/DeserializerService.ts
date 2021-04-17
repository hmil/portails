import { PortailsScene } from 'dto';
import { PortailsGeometry, PortailsObject, PortailsSceneV2, PortailsSprite, PortailsTransform } from 'dto/v2';
import { ObjectGeometry, Transform } from 'editor/model/geometry';
import { computeObjectBoundingBox, WorldObject } from 'editor/model/object';
import { Scene } from 'editor/model/scene';
import { ObjectSprite } from 'editor/model/sprite';
import { uniqId } from 'editor/utils/uid';
import { createServiceModule } from './injector';

export class DeserializerService {

    deserialize(data: string): Scene {
        const parsed: unknown = JSON.parse(data);
        const validation = PortailsScene.validate(parsed);
        if (!validation.success) {
            throw new Error(validation.message);
        }
        return this.fromDTO(validation.value);
    }


    fromDTO(scene: PortailsScene): Scene {
        return this.fromV2(scene);
    }

    private fromV2(scene: PortailsSceneV2): Scene {
        return {
            objects: scene.objects.map(this.hydrateObject)
        }
    }

    private hydrateObject = (object: PortailsObject): WorldObject => {
        const guid = String(uniqId());
        const sprites = object.sprites.map((s) => this.hydrateSprite(guid, s));
        const geometries = object.geometries.map((g) => this.hydrateGeometry(guid, g));
        const draft: WorldObject = {
            geometries,
            guid,
            properties: {
                name: object.name,
                transform: this.hydrateTransform(object.transform)
            },
            sprites,
            boundingBox: {top: 0, right: 0, bottom: 0, left: 0}
        };
        draft.boundingBox = computeObjectBoundingBox(draft);
        return draft;
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
                transform: this.hydrateTransform(sprite.transform),
                background: sprite.background ?? false
            },
            spriteId
        };
    }


    private hydrateGeometry(ownerId: string, geometry: PortailsGeometry): ObjectGeometry {
        const geometryId = String(uniqId());
        return {
            type: 'chain',
            geometryId,
            ownerId,
            name: geometry.name,
            vertices: geometry.vertices
        };
    }
}

export const DeserializerServiceModule = createServiceModule(DeserializerService);
