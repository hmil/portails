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
import { ImageFrame } from 'lib/assets-loader';
import { rigidBodyTransform } from 'lib/glutils';

// const RADIUS = 50;

const HEIGHT = 1.6;
const WIDTH = 0.8;

const SPEED = 15;

function animationSequence(width: number, height: number, frames: number) {
    let ret: ImageFrame[] = []; 
    for (let i = 0 ; i < frames ; i++) {
        ret.push({
            x: i * width,
            y: 0,
            w: width,
            h: height
        });
    }
    return ret;
}

export class PlayerCharacter extends GameObject implements Portalizable, Sprite {

    public portalSurrogate = initPortalSurrogate();

    private keys = {
        up: 0,
        down: 0,
        left: 0,
        right: 0
    };

    public body: planck.Body = this.createBody();

    private gunSprite = new StandardSprite(this.context.graphics, this.context.assets.characterGun, WIDTH, WIDTH/2, []);
    private idleSprite = new StandardSprite(this.context.graphics, this.context.assets.characterIdle, 0.7*HEIGHT, HEIGHT,
        animationSequence(454, 649, 12), { zIndex: 2, animationFPS: 12 });
    private runSprite = new StandardSprite(this.context.graphics, this.context.assets.characterRun, 0.7*HEIGHT * 482 / 454, HEIGHT * 686 / 649, 
        animationSequence(482, 686, 8), { zIndex: 2, animationFPS: 20 });
    private jumpSprite = new StandardSprite(this.context.graphics, this.context.assets.characterJump, 0.7*HEIGHT * 545 / 454, HEIGHT * 704 / 649, 
        animationSequence(545, 704, 8), { zIndex: 2, animationFPS: 20, oneShot: true  });

    public sprite = this;
    public bodySprite = this.idleSprite;
    public modelTransform = mat3.identity(mat3.create());

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
        
        this.body.setPosition(planck.Vec2(4, 0));
        this.propeller.setPosition(planck.Vec2(0, 0));

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

        mat3.identity(this.bodySprite.transform);
        mat3.identity(this.gunSprite.transform);
        rigidBodyTransform(this.modelTransform, this.body);

        const mousePos = this.context.graphics.mapToWorldCoordinates(this.mouseCoords[0], this.mouseCoords[1]);
        const gunAngle = Math.atan2(mousePos[1] - PortalService.playerPos[1], mousePos[0] - PortalService.playerPos[0]) - this.body.getAngle();

        const mouseToTheLeft = (gunAngle < -Math.PI / 2 || gunAngle > Math.PI / 2);
        this.setDirection((this.mirror ? !mouseToTheLeft : mouseToTheLeft) ? 'left' : 'right');
        
        // TODO: Account for this.mirror in coordinates
        const centerOfRotation = mouseToTheLeft ? vec2.fromValues(0.2, -0.1) : vec2.fromValues(-0.2, -0.1);
        mat3.translate(this.gunSprite.transform, this.gunSprite.transform, mouseToTheLeft ? vec2.fromValues(-0.3, 0.2) : vec2.fromValues(0.3, 0.2));

        mat3.translate(this.gunSprite.transform, this.gunSprite.transform, centerOfRotation);

        mat3.rotate(this.gunSprite.transform, this.gunSprite.transform, mouseToTheLeft ? gunAngle - Math.PI : gunAngle);
        mat3.translate(this.gunSprite.transform, this.gunSprite.transform, vec2.mul(centerOfRotation, centerOfRotation, vec2.fromValues(-1, -1)));

        const isTouchingTheGround = this.isPlayerTouchingTheGround();
        if (!isTouchingTheGround && this.bodySprite !== this.jumpSprite) {
            this.bodySprite = this.jumpSprite;
            this.bodySprite.resetAnimation();
        } else if (isTouchingTheGround) {
            if (this.keys.left - this.keys.right !== 0) {
                this.bodySprite = this.runSprite;
                // mat3.translate(this.sprite.transform, this.sprite.transform, vec2.fromValues(0, 0.1));
            } else {
                this.bodySprite = this.idleSprite;
            }
        }

        if (this.mirror ? this.direction === 'right' : this.direction === 'left') {
            mat3.scale(this.bodySprite.transform, this.bodySprite.transform, vec2.fromValues(-1, 1));
            mat3.scale(this.gunSprite.transform, this.gunSprite.transform, vec2.fromValues(-1, 1));
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

    draw(): void {
        mat3.copy(this.bodySprite.modelTransform, this.modelTransform);
        mat3.copy(this.gunSprite.modelTransform, this.modelTransform);
        this.bodySprite.draw();
        this.gunSprite.draw();
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

        const [x, y] = this.context.graphics.mapToWorldCoordinates(evt.clientX, evt.clientY);

        const playerPos = this.body.getPosition();

        const direction = planck.Vec2(x - playerPos.x, y - playerPos.y);
        direction.normalize();
        const start = playerPos.clone();

        this.createObject(Projectile, {
            position: start,
            direction: direction.clone().mul(30).add(this.body.getLinearVelocity()),
            type: evt.button === 0 ? 1 : 2,
            portal: this.portal
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
