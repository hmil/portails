import { Context } from './context';

const BEFORE_PHYSICS_EVT = {
    type: 'before-physics',
    data: undefined
};
const AFTER_PHYSICS_EVT = {
    type: 'after-physics',
    data: undefined
};
const BEFORE_RENDER_EVT = {
    type: 'before-render',
    data: undefined
};
const AFTER_RENDER_EVT = {
    type: 'after-render',
    data: undefined
};

export class GameLoop {

    private _running = false;
    private _animFrame: number | null = null;

    private lastTime: number = 0;

    private stoppedInBackground = false;

    constructor(
        private readonly context: Context,
    ) {
        document.addEventListener('visibilitychange', this.onVisibilityChange);
    }

    private onVisibilityChange = () => {
        if (document.hidden && this._running) {
            this.stop();
            this.stoppedInBackground = true;
        } else if (!document.hidden && this.stoppedInBackground) {
            this.start();
            this.stoppedInBackground = false;
        }
    }

    public start() {
        if (this._running) {
            return;
        }
        console.log('Starting');
        this._running = true;
        this.lastTime = Date.now();
        this.scheduleNext();
    }

    public stop() {
        if (this._animFrame != null) {
            console.log('Stopping');
            cancelAnimationFrame(this._animFrame);
            this._animFrame = null;
            this._running = false;
        }
    }

    private step = () => {
        this._animFrame = null;

        const time = Date.now();
        const delta = time - this.lastTime;
        this.lastTime = time;

        this.context.events.emit(BEFORE_PHYSICS_EVT);
        this.context.physics.step(delta);
        this.context.events.emit(AFTER_PHYSICS_EVT);
        this.context.events.emit(BEFORE_RENDER_EVT);
        this.context.graphics.draw();
        this.context.events.emit(AFTER_RENDER_EVT);
    
        this.scheduleNext();
    }

    private scheduleNext() {
        if (this._running && this._animFrame == null) {
            this._animFrame = requestAnimationFrame(this.step);
        }
    }
}