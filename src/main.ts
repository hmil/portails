import { AssetsLibrary } from 'lib/assets';
import { AssetsLoader } from 'lib/assets-loader';
import { Controller } from 'lib/controller';
import { GameLoop } from 'lib/game-loop';
import { Graphics } from 'lib/graphics';
import { Level1 } from 'lib/levels/level1';
import { Physics } from 'lib/physics';
import { GameWorld } from 'lib/game-world';

async function main() {

    const loader = new AssetsLoader();
    const assets = await loader.load(AssetsLibrary);

    const graphics = new Graphics(assets);
    const physics = new Physics();
    const world = new GameWorld(physics, graphics);
    const controller = new Controller(world, physics, graphics);
    const gameLoop = new GameLoop(physics, graphics, controller);

    const level = new Level1(world);
    level.init();

    gameLoop.start();
    // tileSheet(graphics.ctx);
}

document.addEventListener('DOMContentLoaded', main);