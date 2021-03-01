import { Assets } from "./assets";
import { EventBus } from "./events";
import { Graphics } from "./graphics";
import { Physics } from "./physics";

export class Context {

    constructor(public readonly physics: Physics,
                public readonly graphics: Graphics,
                public readonly events: EventBus,
                public readonly assets: Assets) {}
}