import { image, LoadedAssets } from "./assets-loader";


const SPRITESHEET_1 = '/static/spritesheet-1.png';

export const AssetsLibrary = {
    // background: image(SPRITESHEET_1, 0, 0, 511, 511),
    wallFull: image(SPRITESHEET_1, 6 * 256, 0, 255, 255),
    box: image('/static/tiles-pack-1/Box.png', 0, 0, 256, 256),
    barrel: image('/static/tiles-pack-1/Barrel (1).png', 0, 0, 177, 238),
    background: image('/static/level1.png', 0, 0, 4616, 2436),
    foreground: image('/static/level1_fg.png', 0, 0, 4616, 2436),
    character0: image('/static/character/Idle__000.png', 0, 0, 290, 500),
    character1: image('/static/character/Idle__001.png', 0, 0, 290, 500),
    character2: image('/static/character/Idle__002.png', 0, 0, 290, 500),
    character3: image('/static/character/Idle__003.png', 0, 0, 290, 500),
    character4: image('/static/character/Idle__004.png', 0, 0, 290, 500),
    character5: image('/static/character/Idle__005.png', 0, 0, 290, 500),
    character6: image('/static/character/Idle__006.png', 0, 0, 290, 500),
    character7: image('/static/character/Idle__007.png', 0, 0, 290, 500),
    character8: image('/static/character/Idle__008.png', 0, 0, 290, 500),
    character9: image('/static/character/Idle__009.png', 0, 0, 290, 500),

    characterRun0: image('/static/character/Run__000.png', 0, 0, 376, 520),
    characterRun1: image('/static/character/Run__001.png', 0, 0, 376, 520),
    characterRun2: image('/static/character/Run__002.png', 0, 0, 376, 520),
    characterRun3: image('/static/character/Run__003.png', 0, 0, 376, 520),
    characterRun4: image('/static/character/Run__004.png', 0, 0, 376, 520),
    characterRun5: image('/static/character/Run__005.png', 0, 0, 376, 520),
    characterRun6: image('/static/character/Run__006.png', 0, 0, 376, 520),
    characterRun7: image('/static/character/Run__007.png', 0, 0, 376, 520),
    characterRun8: image('/static/character/Run__008.png', 0, 0, 376, 520),
    characterRun9: image('/static/character/Run__009.png', 0, 0, 376, 520),

    characterJump0: image('/static/character/Jump__000.png', 0, 0, 399, 543),
    characterJump1: image('/static/character/Jump__001.png', 0, 0, 399, 543),
    characterJump2: image('/static/character/Jump__002.png', 0, 0, 399, 543),
    characterJump3: image('/static/character/Jump__003.png', 0, 0, 399, 543),
    characterJump4: image('/static/character/Jump__004.png', 0, 0, 399, 543),
    characterJump5: image('/static/character/Jump__005.png', 0, 0, 399, 543),
    characterJump6: image('/static/character/Jump__006.png', 0, 0, 399, 543),
    characterJump7: image('/static/character/Jump__007.png', 0, 0, 399, 543),
    characterJump8: image('/static/character/Jump__008.png', 0, 0, 399, 543),
    characterJump9: image('/static/character/Jump__009.png', 0, 0, 399, 543),
}

export type Assets = LoadedAssets<typeof AssetsLibrary>;
