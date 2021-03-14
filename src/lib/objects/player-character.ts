import { mat3, vec2 } from 'gl-matrix';
import { Camera, SCREEN_HEIGHT, SCREEN_WIDTH } from 'lib/graphics';
import { PortalService } from 'lib/PortalService';
import { Sprite } from 'lib/graphics/sprite';
import * as planck from 'planck-js';
import { Vec2 } from 'planck-js';

import { GameObject } from './game-object';
import { initPortalSurrogate, Portal, Portalizable, PortalSurrogate } from './portal';
import { Projectile } from './projectile';
import { StandardSprite } from 'lib/graphics/standard-sprite';

// const RADIUS = 50;

const HEIGHT = 1.6;
const WIDTH = 0.8;

const SPEED = 15;

export class PlayerCharacter extends GameObject implements Portalizable, Sprite {

    public portalSurrogate = initPortalSurrogate();

    private keys = {
        up: 0,
        down: 0,
        left: 0,
        right: 0
    };

    public body: planck.Body = this.createBody();

    private idleSprite = new StandardSprite(this.context.graphics, this.body, this.context.assets.characterIdle, WIDTH, HEIGHT, [
        { x: 0, y: 0, w: 290, h: 500},
        { x: 290, y: 0, w: 290, h: 500},
        { x: 290 * 2, y: 0, w: 290, h: 500},
        { x: 290 * 3, y: 0, w: 290, h: 500},
        { x: 290 * 4, y: 0, w: 290, h: 500},
        { x: 290 * 5, y: 0, w: 290, h: 500},
        { x: 290 * 6, y: 0, w: 290, h: 500},
        { x: 290 * 7, y: 0, w: 290, h: 500},
        { x: 290 * 8, y: 0, w: 290, h: 500},
        { x: 290 * 9, y: 0, w: 290, h: 500},
    ], { zIndex: 2, animationFPS: 12 });
    private runSprite = new StandardSprite(this.context.graphics, this.body, this.context.assets.characterRun, WIDTH * 1.3, HEIGHT, [
        { x: 0, y: 0, w: 376, h: 520},
        { x: 376, y: 0, w: 376, h: 520},
        { x: 376 * 2, y: 0, w: 376, h: 520},
        { x: 376 * 3, y: 0, w: 376, h: 520},
        { x: 376 * 4, y: 0, w: 376, h: 520},
        { x: 376 * 5, y: 0, w: 376, h: 520},
        { x: 376 * 6, y: 0, w: 376, h: 520},
        { x: 376 * 7, y: 0, w: 376, h: 520},
        { x: 376 * 8, y: 0, w: 376, h: 520},
        { x: 376 * 9, y: 0, w: 376, h: 520},
    ], { zIndex: 2, animationFPS: 20 });
    private jumpSprite = new StandardSprite(this.context.graphics, this.body, this.context.assets.characterJump, WIDTH * 1.35, HEIGHT * 1.1, [
        { x: 0, y: 0, w: 399, h: 543},
        { x: 399, y: 0, w: 399, h: 543},
        { x: 399 * 2, y: 0, w: 399, h: 543},
        { x: 399 * 3, y: 0, w: 399, h: 543},
        { x: 399 * 4, y: 0, w: 399, h: 543},
        { x: 399 * 5, y: 0, w: 399, h: 543},
    ], { zIndex: 2, animationFPS: 20, oneShot: true  });

    public sprite = this.idleSprite;

    readonly zIndex = 2;

    private mirror = false;

    private direction: 'left' | 'right' = 'left';

    private portal = this.createObject(Portal, undefined);

    private propeller = this.createPropeller();
    private motorJoint = this.createMotor();

    private camera!: Camera;

    // private propellerSprite = new StandardSprite(this.propeller, this.context.assets.wallFull, 1, 1);

    private mouseCoords: [number, number] = [0, 0];

    init() {
        this.context.graphics.addSprite(this);
        this.camera = this.context.graphics.createCamera();
        // this.context.graphics.addSprite(thids.propellerSprite);
        
        this.body.setPosition(planck.Vec2(11, 10));
        this.propeller.setPosition(planck.Vec2(11, 10));

        window.addEventListener('keydown', this.onKeydown);
        window.addEventListener('keyup', this.onKeyUp);
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mousedown', this.onMouseDown);

        this.on('before-physics', this.update);
        this.on('after-physics', this.trackView);
    }

    public onPortal() {
        console.log('portalizing');
        this.mirror = PortalService.isMirror ? !this.mirror : this.mirror;
    }

    private trackView = () => {
        if (this.body == null) {
            return;
        }

        const camera = this.camera;
        camera.resetTransform();
        camera.translate(SCREEN_WIDTH/2, SCREEN_HEIGHT/2);
        if (this.mirror) {
            mat3.scale(camera.transform, camera.transform, vec2.fromValues(-1, 1));
        }
        camera.rotate(-this.body.getAngle());
        camera.translate(-this.body.getPosition().x, -this.body.getPosition().y);
        // const mouseWorldCoords = this.context.graphics.mapToWorldCoordinates(this.mouseCoords[0], this.mouseCoords[1]);
        // camera.translate(-(9 * this.body.getPosition().x + mouseWorldCoords[0])/10, -(9*this.body.getPosition().y + mouseWorldCoords[1])/10);

        mat3.identity(this.sprite.transform);

        const isTouchingTheGround = this.isPlayerTouchingTheGround();
        if (!isTouchingTheGround && this.sprite !== this.jumpSprite) {
            this.sprite = this.jumpSprite;
            this.sprite.resetAnimation();
        } else if (isTouchingTheGround) {
            if (this.keys.left - this.keys.right !== 0) {
                this.sprite = this.runSprite;
                mat3.translate(this.sprite.transform, this.sprite.transform, vec2.fromValues(0, 0.1));
            } else {
                this.sprite = this.idleSprite;
            }
        }


        if (this.mirror ? this.direction === 'right' : this.direction === 'left') {
            mat3.scale(this.sprite.transform, this.sprite.transform, vec2.fromValues(-1, 1));
        }

        mat3.copy(PortalService.playerTransform, camera.transform);
        vec2.set(PortalService.playerPos, this.body.getPosition().x, this.body.getPosition().y);
    }

    private update = () => {
        const playerAngle = this.body.getAngle();
        if (playerAngle != 0) {
            if (Math.abs(playerAngle) < 0.1) {
                this.body.setAngle(0);
            } else {
                this.body.setAngle(this.body.getAngle() - 0.05 * Math.sign(this.body.getAngle()));
            }
        }
        const direction = this.keys.right - this.keys.left;
        // if (this.isPlayerTouchingTheGround(this.body)) {
        //     const v = this.body?.getLinearVelocity();
        //     const force = planck.Vec2(-v.x * 1, 0); // Breaking force
            
        //     if (direction != 0) {
        //         force.x += (direction * 30) * (this.mirror ? -1 : 1); // Moving force
        //     }
            
        //     this.body.applyForce(force, this.body.getPosition(), true);
        // }

        if (direction != 0) {
            this.motorJoint.setMotorSpeed(direction * SPEED * (this.mirror ? -1 : 1));
            this.setDirection(direction > 0 ? 'right' : 'left');
        } else {
            this.motorJoint.setMotorSpeed(0);
        }
    }

    private isPlayerTouchingTheGround() {
        return this.isTouchingTheGround(this.propeller) || this.isTouchingTheGround(this.body);
    }

    private isTouchingTheGround(body: planck.Body) {
        for (let ce = body.getContactList(); ce != null; ce = ce.next ?? null) {
            const c = ce.contact;
            if (!c.isEnabled()) {
                continue;
            }
            const normal = c.getWorldManifold(null)?.normal;
            if (normal && normal.y >= 0) {
                continue;
            }
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

    public createBody(): planck.Body {
        const body = this.context.physics.world.createBody({
            type: 'dynamic',
            position: planck.Vec2(0, 0),
            allowSleep: false,
            angle: 0,
            fixedRotation: true,
            userData: this,
            linearDamping: 0.8,
        });

        body.createFixture({
            shape: planck.Box(WIDTH / 2, (HEIGHT - WIDTH) / 2),
            density: 0.6,
            friction: 0.3,
            
        });
        body.createFixture({
            shape: planck.Circle(Vec2(0, 0), WIDTH/2),
            density: 0.6,
            friction: 0.3
        });
        body.createFixture({
            shape: planck.Circle(Vec2(0, HEIGHT - WIDTH - WIDTH/2 - 0.1), WIDTH/2),
            density: 0.6,
            friction: 0.3
        });

        return body;
    }

    private createPropeller(): planck.Body {
        const body = this.context.physics.world.createDynamicBody(planck.Vec2(0, HEIGHT - WIDTH - WIDTH/2));
        body.createFixture(planck.Circle(WIDTH/2), {
            friction: 10.0,
            density: 0.6
        });
        
        return body;
    }

    private createMotor(): planck.WheelJoint {
        return this.context.physics.world.createJoint(planck.WheelJoint({
            motorSpeed: 0.0,
            maxMotorTorque: 50.0,
            enableMotor: true,
            frequencyHz: 10.0,
            dampingRatio: 1,
        }, this.body, this.propeller, this.propeller.getPosition(), planck.Vec2(0.0, 1.0)))!;
    }

    setDirection(direction: 'left' | 'right') {
        this.direction = direction;
    }

    draw(gl: WebGLRenderingContext): void {
        this.sprite.draw(gl);
    }

    private onMouseMove = (evt: MouseEvent) => {
        this.mouseCoords[0] = evt.x;
        this.mouseCoords[1] = evt.y;
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

        this.createObject(Projectile, {
            position: start,
            direction: direction.clone().mul(30).add(this.body.getLinearVelocity()),
            type: evt.button === 0 ? 1 : 2,
            portal: this.portal
        });
    
        // const end = playerPos.clone().add(direction.mul(100));


        // let f = 1;
        // this.context.physics.world.rayCast(start, end, (fixture, point, normal, fraction) => {
        //     if (fraction < f && fixture.getUserData() !== 'portal-gate' && fixture.getUserData() !== 'portal' && fixture.getBody().isStatic()) {
        //         const position = Vec2(point.x, point.y);
        //         console.log(normal);
        //         if (evt.button === 0) {
        //             this.portal.setPortal1(position, Math.atan2(normal.y, normal.x));
        //         } else if (evt.button === 2) {
        //             this.portal.setPortal2(position, Math.atan2(normal.y, normal.x));
        //         }
        //         f = fraction;
        //     }
        //     return 1;
        // });

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
                if (this.isPlayerTouchingTheGround()) {
                    const force = planck.Vec2(0, -600);
                    this.body.applyForce(force, this.body.getPosition(), true);
                }
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