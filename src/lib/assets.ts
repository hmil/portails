import { image, LoadedAssets } from "./assets-loader";


const SPRITESHEET_1 = '/static/spritesheet-1.png';

export const AssetsLibrary = {
    // background: image(SPRITESHEET_1, 0, 0, 511, 511),
    wallFull: image(SPRITESHEET_1, 6 * 256, 0, 255, 255),
    box: image('/static/tiles-pack-1/Box.png', 0, 0, 256, 256),
    barrel: image('/static/tiles-pack-1/Barrel (1).png', 0, 0, 177, 238),
    background: image('/static/level1.png', 0, 0, 4616, 2436),
    foreground: image('/static/level1_fg.png', 0, 0, 4616, 2436),

    characterIdle: image('/static/idle-sheet.png', 0, 0, 290, 500),
    characterRun: image('/static/run-sheet.png', 0, 0, 290, 500),
    characterJump: image('/static/jump-sheet.png', 0, 0, 290, 500),
}

export type Assets = LoadedAssets<typeof AssetsLibrary>;
