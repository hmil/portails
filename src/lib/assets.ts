import { image, LoadedAssets } from "./assets-loader";


const SPRITESHEET_1 = '/static/spritesheet-1.png';

export const AssetsLibrary = {
    wallFull: image(SPRITESHEET_1),
    box: image('/static/tiles-pack-1/Box.png'),
    barrel: image('/static/tiles-pack-1/Barrel (1).png'),
    background: image('/static/level1.png'),
    foreground: image('/static/level1_fg.png'),

    characterIdle: image('/static/idle.png'),
    characterRun: image('/static/run.png'),
    characterJump: image('/static/jump.png'),
    characterGun: image('/static/gun.png'),
}

export type Assets = LoadedAssets<typeof AssetsLibrary>;
