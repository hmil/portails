import { AssetsLibrary } from 'lib/assets';
import { AssetsLoader } from 'lib/assets-loader';
import { Controller } from 'lib/controller';
import { GameLoop } from 'lib/game-loop';
import { Graphics } from 'lib/graphics';
import { Level1 } from 'lib/levels/level1';
import { FpsMeter } from 'lib/objects/fps-meter';
import { Physics } from 'lib/physics';

async function main() {

    const loader = new AssetsLoader();
    const assets = await loader.load(AssetsLibrary);

    const graphics = new Graphics(assets);
    const physics = new Physics();
    const controller = new Controller(physics, graphics);
    const gameLoop = new GameLoop(physics, graphics, controller);

    const level = new Level1(physics.world, graphics);
    level.init();
    level.createObject(FpsMeter, undefined);

    gameLoop.start();
    // tileSheet(graphics.ctx);
}

document.addEventListener('DOMContentLoaded', main);