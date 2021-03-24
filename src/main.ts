import { AssetsLibrary } from 'lib/assets';
import { AssetsLoader } from 'lib/assets-loader';
import { Context } from 'lib/context';
import { EventBus } from 'lib/events';
import { GameLoop } from 'lib/game-loop';
import { Graphics } from 'lib/graphics';
import { Level1 } from 'lib/levels/level1';
import { loadLevel } from 'lib/loader/level-loader';
import { PlayerCharacter } from 'lib/objects/player-character';
import { Physics } from 'lib/physics';

async function main() {

    const loader = new AssetsLoader();
    const assets = await loader.load(AssetsLibrary);

    const graphics = new Graphics();
    const physics = new Physics();
    const events = new EventBus();
    const context = new Context(physics, graphics, events, assets);
    const gameLoop = new GameLoop(context);
    
    await loadLevel(context);

    gameLoop.start();
    // tileSheet(graphics.ctx);
}

document.addEventListener('DOMContentLoaded', main);