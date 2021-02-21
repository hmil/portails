import { Assets } from 'lib/assets';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from 'lib/graphics';
import * as planck from 'planck-js';
import { Vec2 } from 'planck-js';

import { GameObject, Portalizable } from './game-object';
import { Portal } from './portal';

// const RADIUS = 50;

const HEIGHT = 1.6;
const WIDTH = 0.8;

export class PlayerCharacter extends GameObject implements Portalizable {
    
    private toTeleport: Array<{ body: planck.Body, nextPos: Vec2, nextSpeed: Vec2, nextAngle: number}> = [];

    private keys = {
        up: 0,
        down: 0,
        left: 0,
        right: 0
    };

    public body?: planck.Body;

    readonly zIndex = 2;

    private direction: 'left' | 'right' = 'left';

    private portal = this.createObject(Portal, { teleportArray: this.toTeleport });

    surrogate = {
        sprite: {
            zIndex: 2,
            draw: (ctx: CanvasRenderingContext2D, assets: Assets) => {
                if (!this.surrogate.active) {
                    return;
                }
                this.drawCharacter(ctx, assets, this.surrogate.body.getPosition(), this.surrogate.body.getAngle());
            }
        },
        body: (() => {
            const body = this.world.createBody({
                type: 'dynamic',
                position: planck.Vec2(4, 14),
                allowSleep: false,
                angle: 0,
                fixedRotation: true,
            });
            // let box = planck.Box(WIDTH / 2, HEIGHT / 2);
            // body.createFixture({
            //     shape: box,
            //     density: 1.0,
            //     friction: 0.3
            // });
            return body;
        })(),
        active: false
    }

    init() {
        this.createBody();
        this.graphics.addSprite(this);

        window.addEventListener('keydown', this.onKeydown);
        window.addEventListener('keyup', this.onKeyUp);
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mousedown', this.onMouseDown);

        requestAnimationFrame(this.update);
    }

    public update = () => {
        if (this.body == null) {
            return;
        }

        for (let i = 0 ; i < this.toTeleport.length ; i++) {
            const { body, nextPos, nextSpeed, nextAngle } = this.toTeleport[i];
            body.setPosition(nextPos);
            body.setLinearVelocity(nextSpeed)
            body.setAngle(nextAngle);
        }

        const playerAngle = this.body.getAngle();
        if (playerAngle != 0) {
            if (Math.abs(playerAngle) < 0.1) {
                this.body.setAngle(0);
            } else {
                this.body.setAngle(this.body.getAngle() - 0.05 * Math.sign(this.body.getAngle()));
            }
        }
        // this.body.setAngle(1);
        this.toTeleport.length = 0;
        const direction = this.keys.right - this.keys.left;
        if (this.isPlayerTouchingTheGround(this.body)) {
            const v = this.body?.getLinearVelocity();
            const force = planck.Vec2(-v.x * 1, -this.keys.up * 500); // Breaking force + jump
            
            if (direction != 0) {
                force.x += direction * 30; // Moving force
            }
            
            this.body.applyForce(force, this.body.getPosition(), true);
            // Body.applyForce(this.body, this.body.position, force);
        }

        if (direction != 0) {
            this.setDirection(direction > 0 ? 'right' : 'left');
        }

        const camera = this.graphics.getMainCamera();
        camera.resetTransform();
        camera.translate(-SCREEN_WIDTH/2, -SCREEN_HEIGHT/2);
        camera.rotate(this.body.getAngle());
        camera.translate(this.body.getPosition().x, this.body.getPosition().y);
        requestAnimationFrame(this.update);
    }

    private isPlayerTouchingTheGround(body: planck.Body) {
        for (let ce = body.getContactList(); ce != null; ce = ce.next ?? null) {
            const c = ce.contact;
            const points = c.getWorldManifold(null)?.points;
            if (points) {
                for (const p of points) {
                    if (p.y > body.getPosition().y) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private createBody(): planck.Body {
        this.body = this.world.createBody({
            type: 'dynamic',
            position: planck.Vec2(5, 15),
            allowSleep: false,
            angle: 0,
            fixedRotation: true,
            userData: this
        });

        this.body.createFixture({
            shape: planck.Box(WIDTH / 2, (HEIGHT - WIDTH) / 2),
            density: 1.0,
            friction: 0.3,
            
        });
        this.body.createFixture({
            shape: planck.Circle(Vec2(0, 0), WIDTH/2),
            density: 1.0,
            friction: 0.3
        });
        this.body.createFixture({
            shape: planck.Circle(Vec2(0, HEIGHT - WIDTH - WIDTH/2), WIDTH/2),
            density: 1.0,
            friction: 0.3
        });

        return this.body;
    }

    setDirection(direction: 'left' | 'right') {
        this.direction = direction;
    }

    draw(ctx: CanvasRenderingContext2D, assets: Assets) {
        if (this.body == null) {
            return;
        }
        this.drawCharacter(ctx, assets, this.body.getPosition(), this.body.getAngle());
    }

    private drawCharacter(ctx: CanvasRenderingContext2D, assets: Assets, position: Vec2, angle: number) {
        ctx.strokeStyle = '#f00';
        ctx.fillStyle = '#fff';
        ctx.translate(position.x, position.y);
        ctx.rotate(angle);

        if (this.direction === 'left') {
            ctx.scale(-1, 1);
        }
        assets.character.draw(ctx, -WIDTH / 2, -HEIGHT / 2, WIDTH, HEIGHT);
        ctx.stroke();
    }


    private onMouseMove = (evt: MouseEvent) => {
        // const [x, y] = this.graphics.mapToWorldCoordinates(evt.clientX, evt.clientY);
        // this.crosshair.setPosition(x, y);
    };

    private onMouseDown = (evt: MouseEvent) => {

        evt.preventDefault();
        evt.stopPropagation();

        if (this.body == null) {
            return;
        }

        const [x, y] = this.graphics.mapToWorldCoordinates(evt.clientX, evt.clientY);

        const playerPos = this.body.getPosition();

        const direction = planck.Vec2(x - playerPos.x, y - playerPos.y);
        direction.normalize();
        const start = playerPos.clone().add(direction);
        const end = playerPos.clone().add(direction.mul(100));

        let f = 1;
        this.world.rayCast(start, end, (fixture, point, normal, fraction) => {
            if (fraction < f && fixture.getUserData() !== 'portal-gate' && fixture.getUserData() !== 'portal') {
                const position = Vec2(point.x, point.y);
                console.log(normal);
                if (evt.button === 0) {
                    this.portal.setPortal1(position, Math.atan2(normal.y, normal.x));
                } else if (evt.button === 2) {
                    this.portal.setPortal2(position, Math.atan2(normal.y, normal.x));
                }
                f = fraction;
            }
            return 1;
        });

        return false;
    };

    private onKeydown = (evt: KeyboardEvent) => {
        switch (evt.key) {
            case 'ArrowRight':
            case 'd':
                this.keys.right = 1;
                break;
            case 'ArrowUp':
            case 'w':
                this.keys.up = 1;
                break;
            case 'ArrowLeft':
            case 'a':
                this.keys.left = 1;
                break;
            case 's':
            case 'ArrowDown':
                this.keys.down = 1;
                break;
        }
    }

    private onKeyUp = (evt: KeyboardEvent) => {
        switch (evt.key) {
            case 'ArrowRight':
            case 'd':
                this.keys.right = 0;
                break;
            case 'ArrowUp':
            case 'w':
                this.keys.up = 0;
                break;
            case 'a':
            case 'ArrowLeft':
                this.keys.left = 0;
                break;
            case 's':
            case 'ArrowDown':
                this.keys.down = 0;
                break;
        }
    }
}