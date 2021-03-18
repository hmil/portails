import { vec2 } from 'gl-matrix';
import { StandardSprite } from 'lib/graphics/standard-sprite';
import { Barrel } from 'lib/objects/barrel';
import { Box } from 'lib/objects/box';
import { GameObject } from 'lib/objects/game-object';
import { PORTAL_PROJECTILE_CATEGORY } from 'lib/objects/projectile';
import { Chain, Vec2 } from 'planck-js';

const SCALING = 64;
const offset = Vec2(-541, 68);

function toWorld(v: Vec2) {
    return v.sub(offset).mul(1/SCALING);
}

export class Level1 extends GameObject {

    public init() {
        // this.createObject(Wall, [0, 16, 32, 1]);
        // this.createObject(Wall, [32, 0, 1, 16])
        // this.createObject(Wall, [0, 0, 32, 1])
        // this.createObject(Wall, [0, 0, 1, 16])

        // this.createObject(Wall, [5, 10, 1, 1])
        // this.createObject(Wall, [6, 10, 1, 1])
        // // this.createObject(Wall, [7, 10, 1, 1])
        // this.createObject(Wall, [8, 10, 1, 1])
        // this.createObject(Wall, [9, 10, 1, 1])
        // this.createObject(Wall, [4, 9, 1, 1])
        // this.createObject(Wall, [3, 8, 1, 1])
        // this.createObject(Wall, [2, 7, 1, 1])
        // this.createObject(Wall, [1, 6, 1, 1])
        // this.createObject(Wall, [9, 9, 1, 1])
        // this.createObject(Wall, [9, 8, 1, 1])
        // this.createObject(Wall, [9, 7, 1, 1])
        // this.createObject(Wall, [9, 6, 1, 1])

        // this.createObject(Wall, [8, 15, 1, 1])
        // this.createObject(Wall, [8, 14, 1, 1])
        // this.createObject(Wall, [9, 15, 1, 1])
        // this.createObject(Wall, [9, 14, 1, 1])

        // this.createObject(Wall, [12, 13, 1, 1, Math.PI/4]);
        // this.createObject(Wall, [15, 12, 1, 1, 2*Math.PI/6]);

        // this.createObject(Geometry, [Vec2(16, 16), Vec2(20, 12), Vec2(20, 16)]);
        
        this.createObject(Barrel, [20, 5]);
        this.createObject(Barrel, [14.5, 15]);
        this.createObject(Box, [12.1, 8]);

        const terrain = this.context.physics.world.createBody();
        terrain.createFixture({
            filterCategoryBits: 0x1 | PORTAL_PROJECTILE_CATEGORY,
            shape: Chain([
                toWorld(Vec2(-71, 0.0)),
                toWorld(Vec2(-71, 612.802)),
                toWorld(Vec2(61.33, 611.151)),
                toWorld(Vec2(61.33, 813)),
                toWorld(Vec2(612.275, 813)),
                toWorld(Vec2(612.275, 769.891)),
                toWorld(Vec2(677.116, 769.891)),
                toWorld(Vec2(677.116, 814)),
                toWorld(Vec2(1164.105, 814)),
                toWorld(Vec2(1164.105, 607.698)),
                toWorld(Vec2(1089.773, 607.698)),
                toWorld(Vec2(1089.773, 540.638)),
                toWorld(Vec2(1156.638, 540.638)),
                toWorld(Vec2(1156.638, 472.751)),
                toWorld(Vec2(1287.987, 472.751)),
                toWorld(Vec2(1423.733, 542.685)),
            ])
        });
        terrain.createFixture({
            filterCategoryBits: 0x1 | PORTAL_PROJECTILE_CATEGORY,
            shape: Chain([
                toWorld(Vec2(481.296, 81.135)),
                toWorld(Vec2(481.296, 544.562)),
                toWorld(Vec2(611.777, 544.562)),
                toWorld(Vec2(611.777, 701.534)),
                toWorld(Vec2(676.559, 701.534)),
                toWorld(Vec2(676.559, 543.051)),
                toWorld(Vec2(739.034, 543.051)),
                toWorld(Vec2(739.034, 84.555)),
            ])
        });

        const wallpaperWidth = 2308 / 64;
        const wallpaperHeight = 1218 / 64;
        this.context.graphics.addSprite(
            new StandardSprite(this.context.graphics, this.context.assets.foreground, wallpaperWidth, wallpaperHeight, [], {
                zIndex: 3,
                offset: vec2.fromValues(wallpaperWidth/2, wallpaperHeight/2),
            }));
        this.context.graphics.addSprite(
            new StandardSprite(this.context.graphics, this.context.assets.background, wallpaperWidth, wallpaperHeight, [], {
                zIndex: 1,
                offset: vec2.fromValues(wallpaperWidth/2, wallpaperHeight/2),
        }));
    }
}