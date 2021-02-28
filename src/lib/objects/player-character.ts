import { mat3, vec2 } from 'gl-matrix';
import { Assets } from 'lib/assets';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from 'lib/graphics';
import { PortalService } from 'lib/PortalService';
import * as planck from 'planck-js';
import { Vec2 } from 'planck-js';

import { GameObject } from './game-object';
import { Portal, Portalizable } from './portal';

// const RADIUS = 50;

const HEIGHT = 1.6;
const WIDTH = 0.8;

export class PlayerCharacter extends GameObject implements Portalizable {

    private keys = {
        up: 0,
        down: 0,
        left: 0,
        right: 0
    };

    public body?: planck.Body;

    readonly zIndex = 2;

    private mirror = false;

    private direction: 'left' | 'right' = 'left';

    private portal = this.createObject(Portal, undefined);

    surrogate = {
        sprite: {
            zIndex: 2,
            draw: (ctx: CanvasRenderingContext2D, assets: Assets) => {
                if (!this.surrogate.canDraw) {
                    return;
                }
                this.drawCharacter(ctx, assets, this.surrogate.body.getPosition(), this.surrogate.body.getAngle(), (this.mirror ? !PortalService.isMirror : PortalService.isMirror) ? this.direction === 'right' : this.direction === 'left');
            }
        },
        body: (() => {
            const body = this.context.physics.world.createBody({
                type: 'static',
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
        active: 0,
        canDraw: true
    }

    init() {
        this.createBody();
        this.context.graphics.addSprite(this);
        this.context.graphics.addSprite(this.surrogate.sprite);

        window.addEventListener('keydown', this.onKeydown);
        window.addEventListener('keyup', this.onKeyUp);
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mousedown', this.onMouseDown);

        this.on('before-physics', this.update);
        this.on('before-render', this.trackView);
    }

    public onPortal() {
        this.mirror = PortalService.isMirror ? !this.mirror : this.mirror;
    }

    private trackView = () => {
        if (this.body == null) {
            return;
        }

        const camera = this.context.graphics.getMainCamera();
        camera.resetTransform();
        camera.translate(SCREEN_WIDTH/2, SCREEN_HEIGHT/2);
        if (this.mirror) {
            mat3.scale(camera.transform, camera.transform, vec2.fromValues(-1, 1));
        }
        camera.rotate(-this.body.getAngle());
        camera.translate(-this.body.getPosition().x, -this.body.getPosition().y);
    }

    private update = () => {
        if (this.body == null) {
            return;
        }


        const playerAngle = this.body.getAngle();
        if (playerAngle != 0) {
            if (Math.abs(playerAngle) < 0.1) {
                this.body.setAngle(0);
            } else {
                this.body.setAngle(this.body.getAngle() - 0.05 * Math.sign(this.body.getAngle()));
            }
        }
        const direction = this.keys.right - this.keys.left;
        if (this.isPlayerTouchingTheGround(this.body)) {
            const v = this.body?.getLinearVelocity();
            const force = planck.Vec2(-v.x * 1, (this.keys.down - this.keys.up) * 550); // Breaking force + jump
            
            if (direction != 0) {
                force.x += (direction * 30) * (this.mirror ? -1 : 1); // Moving force
            }
            
            this.body.applyForce(force, this.body.getPosition(), true);
        }

        if (direction != 0) {
            this.setDirection(direction > 0 ? 'right' : 'left');
        }
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
        this.body = this.context.physics.world.createBody({
            type: 'dynamic',
            position: planck.Vec2(14, 15),
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
        this.drawCharacter(ctx, assets, this.body.getPosition(), this.body.getAngle(), this.mirror ? this.direction === 'right' : this.direction === 'left');
    }

    private drawCharacter(ctx: CanvasRenderingContext2D, assets: Assets, position: Vec2, angle: number, mirror: boolean) {
        ctx.strokeStyle = '#f00';
        ctx.fillStyle = '#fff';
        ctx.translate(position.x, position.y);
        ctx.rotate(angle);

        if (mirror) {
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

        const [x, y] = this.context.graphics.mapToWorldCoordinates(evt.clientX, evt.clientY);

        const playerPos = this.body.getPosition();

        const direction = planck.Vec2(x - playerPos.x, y - playerPos.y);
        direction.normalize();
        const start = playerPos.clone().add(direction);
        const end = playerPos.clone().add(direction.mul(100));

        let f = 1;
        this.context.physics.world.rayCast(start, end, (fixture, point, normal, fraction) => {
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