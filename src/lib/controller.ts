import { Graphics } from './graphics';

import { PlayerCharacter } from './objects/player-character';
import { Physics } from './physics';
import * as planck from 'planck-js';
import { Vec2 } from 'planck-js';
import { IPortal, Portal } from './objects/portal';


export class Controller {


    private player = new PlayerCharacter(this.physics.world, this.graphics);


    constructor(private readonly physics: Physics, private readonly graphics: Graphics) {
        

        this.player.init();

        
    }

    


}