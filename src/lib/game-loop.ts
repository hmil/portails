import { Controller } from './controller';
import { Graphics } from './graphics';
import { Physics } from './physics';

export class GameLoop {

    private _running = false;
    private _animFrame: number | null = null;

    private lastTime: number = 0;

    constructor(
        private readonly physics: Physics,
        private readonly graphics: Graphics,
        private readonly controls: Controller
    ) { }

    public start() {
        if (this._running) {
            return;
        }
        this._running = true;
        this.scheduleNext();
    }

    public stop() {
        if (this._animFrame != null) {
            cancelAnimationFrame(this._animFrame);
            this._animFrame = null;
        }
    }

    private step = (time: number) => {
        this._animFrame = null;

        const delta = time - this.lastTime;
        this.lastTime = time;

        this.physics.step(delta);
        this.graphics.draw();
    
        this.scheduleNext();
    }

    private scheduleNext() {
        if (this._running && this._animFrame == null) {
            this._animFrame = requestAnimationFrame(this.step);
        }
    }
}