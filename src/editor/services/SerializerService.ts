import { PortailsScene } from 'dto';
import { PortailsGeometry, PortailsObject, PortailsSprite, PortailsTransform } from 'dto/v2';
import { ObjectGeometry, Transform } from 'editor/model/geometry';
import { WorldObject } from 'editor/model/object';
import { Scene } from 'editor/model/scene';
import { ObjectSprite } from 'editor/model/sprite';

export class SerializerService {

    toDTO(scene: Scene): PortailsScene {
        return {
            objects: scene.objects.map(this.serializeObject),
            version: 2
        };
    }
    
    private serializeObject = (object: WorldObject): PortailsObject => {
        return {
            name: object.properties.name,
            transform: this.serializeTransform(object.properties.transform),
            sprites: object.sprites.map(this.serializeSprite),
            geometries: object.geometries.map(this.serializeGeometry)
        };
    }
    
    private serializeTransform = (transform: Transform): PortailsTransform => {
        return {
            a: transform.rotation, x: transform.x, y: transform.y, sX: transform.scaleX, sY: transform.scaleY
        };
    }
    
    private serializeSprite = (sprite: ObjectSprite): PortailsSprite => {
        return {
            name: sprite.properties.name,
            src: sprite.properties.src,
            transform: this.serializeTransform(sprite.properties.transform),
            background: sprite.properties.background
        }
    }

    private serializeGeometry = (sprite: ObjectGeometry): PortailsGeometry => {
        return {
            name: sprite.name,
            vertices: [...sprite.vertices]
        };
    }
}
