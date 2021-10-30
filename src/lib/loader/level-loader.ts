import { PortailsScene } from "dto";
import { vec2 } from "gl-matrix";
import { Context } from "lib/context";
import { StandardSprite } from "lib/graphics/standard-sprite";
import { PlayerCharacter } from "lib/objects/player-character";
import { PORTAL_PROJECTILE_CATEGORY } from "lib/objects/projectile";
import { Chain, Vec2 } from "planck-js";

export async function loadLevel(context: Context) {

    const levelData = await fetch('./static/level.json');
    const validationResult = PortailsScene.validate(await levelData.json());

    if (!validationResult.success) {
        throw new Error(validationResult.message);
    }

    const parsed = validationResult.value;

    await Promise.all(parsed.objects.map(async object => {

        const body = context.physics.world.createBody(Vec2(object.transform.x, object.transform.y));

        const images = new Map<string, HTMLImageElement>();

        await Promise.all(object.sprites.map(sprite => {
            if (images.has(sprite.src)) {
                return;
            }
            const image = new Image();
            image.src = sprite.src.replace(/^\//, './'); // Transform absolute paths to relative
            images.set(sprite.src, image);

            return new Promise((resolve, reject) => {
                image.onload = resolve;
                image.onerror = reject;
            });
        }));

        object.sprites.forEach(sprite => {
            const image = images.get(sprite.src);
            if (!image) {
                throw new Error(`Cannot load sprite ${sprite.src}`);
            }
            context.graphics.addSprite(
                new StandardSprite(context.graphics, image, sprite.transform.sX, sprite.transform.sY, [], {
                    zIndex: sprite.background ? 1 : 3,
                    offset: vec2.fromValues(sprite.transform.x + object.transform.x, sprite.transform.y + object.transform.y),
                }));
        });

        object.geometries.forEach(geometry => {
            body.createFixture({
                filterCategoryBits: 0x1 | PORTAL_PROJECTILE_CATEGORY,
                shape: Chain(geometry.vertices.map(v => Vec2(v.x, v.y)))
            });
        });
    }));

    const player = new PlayerCharacter(context);
    player.init();
}