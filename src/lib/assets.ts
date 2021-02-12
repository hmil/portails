import { image, LoadedAssets } from "./assets-loader";


const SPRITESHEET_1 = '/static/spritesheet-1.png';

export const AssetsLibrary = {
    background: image(SPRITESHEET_1, 0, 0, 511, 511),
    wallFull: image(SPRITESHEET_1, 6 * 256, 0, 255, 255),
    character: image('/static/character/Idle__001.png', 0, 0, 290, 500)
}

export type Assets = LoadedAssets<typeof AssetsLibrary>;
