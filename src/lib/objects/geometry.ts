import { Polygon } from "planck-js";
import { GameObject } from "./game-object";
import { PORTAL_PROJECTILE_CATEGORY } from "./projectile";

export class Geometry extends GameObject<planck.Vec2[]> {

    init(vertices: planck.Vec2[]) {
        const body = this.context.physics.world.createBody();
        const shape = Polygon(vertices);
        body.createFixture({
            shape,
            filterCategoryBits: 0x1 | PORTAL_PROJECTILE_CATEGORY,
        });

        this.context.graphics.addSprite({
            zIndex: 3,
            draw: (ctx) => {
                let minX = 100;
                let minY = 100;
                let maxX = 1;
                let maxY = 1;

                ctx.fillStyle = '#f00';
                ctx.beginPath();
                ctx.moveTo(vertices[vertices.length-1].x, vertices[vertices.length-1].y);
                for (let i = 0 ; i < vertices.length ; i++){
                    const {x, y} = vertices[i];
                    ctx.lineTo(x, y);
                    if (x > maxX) maxX = x;
                    if (x < minX) minX = x;
                    if (y > maxY) maxY = y;
                    if (y < minY) minY = y;
                }
                ctx.clip();

                for (let x = minX ; x < maxX ; x++) {
                    for (let y = minY ; y < maxY ; y++) {
                        this.context.assets.wallFull.draw(ctx, x, y, 1, 1);
                    }
                }
            }
        })
    }
}