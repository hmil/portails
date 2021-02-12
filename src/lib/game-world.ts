import { Graphics } from "./graphics";
import { GameObject } from "./objects/game-object";
import { Physics } from "./physics";

export class GameWorld {

    private objects: GameObject[] = [];

    constructor(private readonly physics: Physics,
                private readonly graphics: Graphics) {}

    public addObject(gameObject: GameObject): void {
        if (gameObject.createBody) {
            gameObject.createBody(this.physics.world);
        }
        this.graphics.addSprite(gameObject.sprite);
        this.objects.push(gameObject);
    }
}