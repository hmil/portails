import { mat3, vec2 } from "gl-matrix";
import { Camera } from "lib/graphics";
import { PortalService } from "lib/PortalService";
import { Sprite, StandardSprite } from "lib/sprite";
import * as planck from "planck-js";
import { Vec2 } from "planck-js";
import { GameObject } from "./game-object";

const WIDTH = 0.2;
const HEIGHT = 2;

export interface IPortal {
    body: planck.Body;
    sensor: planck.Fixture;
    normal: Vec2;
}

export interface PortalSurrogate {
    body: planck.Body;
    sprite: Sprite;
}

export interface Portalizable {
    portalSurrogate: PortalSurrogate | null;
    createBody(): planck.Body;
    sprite: StandardSprite;
    onPortal?: () => void;
}

export function initPortalSurrogate(): PortalSurrogate | null {
    return null;
}

export function isPortalizable(p: unknown): p is Portalizable {
    return typeof p === 'object' && p != null && 'portalSurrogate' in p;
}

export class Portal extends GameObject<void> {

    public body?: planck.Body;

    private portal1?: IPortal;
    private portal2?: IPortal;

    readonly zIndex = 1;

    private portalingBodies = new Map<planck.Body, IPortal>();

    private isDrawing = false;

    private finishedPortalizables: Portalizable[] = [];

    init() {
        this.context.graphics.addSprite(this);

        this.context.physics.world.on('begin-contact', (contact) => {
            if (contact.getFixtureA().getUserData() === 'portal' && contact.getFixtureA().getBody() === this.portal1?.body) {
                this.startPortal(contact.getFixtureB().getBody(), this.portal1);
            } else if (contact.getFixtureA().getUserData() === 'portal' && contact.getFixtureA().getBody() === this.portal2?.body) {
                this.startPortal(contact.getFixtureB().getBody(), this.portal2);
            } else if (contact.getFixtureB().getUserData() === 'portal' && contact.getFixtureB().getBody() === this.portal1?.body) {
                this.startPortal(contact.getFixtureA().getBody(), this.portal1);
            } else if (contact.getFixtureB().getUserData() === 'portal' && contact.getFixtureB().getBody() === this.portal2?.body) {
                this.startPortal(contact.getFixtureA().getBody(), this.portal2);
            } 
        });
        this.context.physics.world.on('end-contact', (contact) => {
            if (contact.getFixtureA().getUserData() === 'portal' && 
                (contact.getFixtureA().getBody() === this.portal1?.body || contact.getFixtureA().getBody() === this.portal2?.body)) {
                this.stopPortal(contact.getFixtureB().getBody());
            } else if (contact.getFixtureB().getUserData() === 'portal' && 
                        (contact.getFixtureB().getBody() === this.portal1?.body || contact.getFixtureB().getBody() === this.portal2?.body)) {
                this.stopPortal(contact.getFixtureA().getBody());
            } 
        });

        this.context.physics.world.on('pre-solve', (contact, oldManifold) => {
            const contactPoints = contact.getWorldManifold(null)?.points;
            if (contactPoints == null) {
                return;
            }

            if (this.portal1 && this.portal2) {
                const wall = contact.getFixtureA().getBody().isStatic() ? contact.getFixtureA() : contact.getFixtureB();
                if (wall.getUserData() === 'portal-gate') {
                    return;
                }
                for (const contactPoint of contactPoints) {
                    if (!this.portal1.sensor.getShape().testPoint(this.portal1.body.getTransform(), contactPoint)
                    && !this.portal2.sensor.getShape().testPoint(this.portal2.body.getTransform(), contactPoint)) {
                        return;
                    }
                }
                contact.setEnabled(false);
            }
        });

        this.on('after-physics', this.update);
        // this.on('before-physics', this.preupdate);
    }

    private stopPortal(body: planck.Body) {
        const userData = body.getUserData();
        if (isPortalizable(userData)) {
            this.portalingBodies.delete(body);
            this.finishedPortalizables.push(userData);
        }
    }

    private startPortal(body: planck.Body, portal: IPortal) {
        const userData = body.getUserData();
        if (isPortalizable(userData)) {
            this.portalingBodies.set(body, portal);
        }
    }

    // private preupdate = () => {
    //     for (const [body, portal] of this.portalingBodies) {
    //         const surrogate = (body.getUserData() as Portalizable).surrogate;

    //         const otherPortal = (this.portal1 === portal) ? this.portal2 : this.portal1;
    //         if (otherPortal == null) {
    //             return;
    //         }

    //         const solution = this.solveTeleportation(surrogate.body, surr)

    //         body.setPosition(surrogate.body.getPosition());
    //     }
    // }

    private update = () => {
        for (const p of this.finishedPortalizables) {
            if (p.portalSurrogate != null) {
                const surrogate = p.portalSurrogate;
                p.portalSurrogate = null;
                this.context.physics.world.destroyBody(surrogate.body);
                this.context.graphics.removeSprite(surrogate.sprite);
            }
        }
        this.finishedPortalizables.length = 0;

        for (const [body, portal] of this.portalingBodies) {
            const otherPortal = (this.portal1 === portal) ? this.portal2 : this.portal1;
            if (otherPortal == null) {
                return;
            }
            
            const solution = this.solveTeleportation(body.getPosition(), body.getLinearVelocity(), body.getAngle(), body.getAngularVelocity(), portal, otherPortal);
            const portalizable = (body.getUserData() as Portalizable);

            if (portalizable.portalSurrogate == null) {
                portalizable.portalSurrogate = this.createSurrogate(portalizable);
            }

            if (solution.primaryDisplacement < 0) {
                portalizable.onPortal?.();
                let joint = body.getJointList();
                while (joint != null) {
                    const otherBody = joint.other;
                    const otherSolution = this.solveTeleportation(otherBody.getPosition(), otherBody.getLinearVelocity(), otherBody.getAngle(), otherBody.getAngularVelocity(), portal, otherPortal);
                    this.teleportBody(otherBody, otherSolution.pos, otherSolution.velocity, otherSolution.rotation, otherSolution.angularVelocity);
                    joint = joint.next;
                }
                this.teleportBody(portalizable.portalSurrogate.body, body.getPosition().clone(), body.getLinearVelocity().clone(), body.getAngle(), body.getAngularVelocity());

                this.teleportBody(body, solution.pos, solution.velocity, solution.rotation, solution.angularVelocity);
            } else {
                this.teleportBody(portalizable.portalSurrogate.body, solution.pos, solution.velocity, solution.rotation, solution.angularVelocity);
            }
        }
    }

    private createSurrogate(portalizable: Portalizable): PortalSurrogate {
        const body = portalizable.createBody();
        body.setUserData('portal-surrogate');
        const sprite: Sprite = {
            get zIndex() { return portalizable.sprite.zIndex; },
            draw(ctx: CanvasRenderingContext2D) {
                const oldBody = portalizable.sprite.body;
                portalizable.sprite.body = body;
                const savedTrsfm = portalizable.sprite.transform;
                if (PortalService.isMirror) {
                    portalizable.sprite.transform = mat3.scale(mat3.create(), portalizable.sprite.transform, vec2.fromValues(-1, 1));
                }
                portalizable.sprite.draw(ctx);

                portalizable.sprite.transform = savedTrsfm;
                portalizable.sprite.body = oldBody;
            }
        }
        this.context.graphics.addSprite(sprite);
        
        return { body, sprite };
    }

    private solveTeleportation(pos: planck.Vec2, velocity: planck.Vec2, rotation: number, rotationSpeed: number, portal: IPortal, otherPortal: IPortal):
        { pos: planck.Vec2, velocity: planck.Vec2, rotation: number, primaryDisplacement: number, angularVelocity: number} {

        const shouldMirror = PortalService.isMirror;

        const portalTangent = Vec2(-portal.normal.y, portal.normal.x);
        const relativeBodyPos = pos.clone().sub(portal.body.getPosition().clone());
        const primaryDisplacement = this.dot(relativeBodyPos, portal.normal);
        const tangentDisplacement = this.dot(relativeBodyPos, portalTangent) * (shouldMirror ? -1 : 1);
        const primaryVelocity = this.dot(velocity, portal.normal);
        const tangentVelocity = this.dot(velocity, portalTangent) * (shouldMirror ? -1.0 : 1.0);

        const srcNormal = vec2.fromValues(-portal.normal.x, -portal.normal.y);
        const dstNormal = vec2.fromValues(otherPortal.normal.x, otherPortal.normal.y);
        if (shouldMirror) {
            vec2.mul(dstNormal, dstNormal, vec2.fromValues(-1, 1));
        }
        const angle = shouldMirror ? Math.atan2(srcNormal[1], srcNormal[0]) - Math.atan2(dstNormal[1], dstNormal[0]) :
        Math.atan2(dstNormal[1], dstNormal[0]) - Math.atan2(srcNormal[1], srcNormal[0]);

        const otherTangent = Vec2(-otherPortal.normal.y, otherPortal.normal.x);
        const nextPos = otherPortal.normal.clone().mul(-primaryDisplacement).add(otherTangent.mul(-tangentDisplacement)).add(otherPortal.body.getPosition().clone());
        const nextAngle = (angle + rotation * (shouldMirror ? -1 : 1)) % (2 * Math.PI);
        const nextSpeed = otherPortal.normal.clone().mul(-primaryVelocity).add(otherTangent.clone().mul(tangentVelocity));

        const nextRotationSpeed = shouldMirror ? -rotationSpeed : rotationSpeed;

        return {pos: nextPos, velocity: nextSpeed, rotation: nextAngle, primaryDisplacement, angularVelocity: nextRotationSpeed}
    }

    private teleportBody(body: planck.Body, position: planck.Vec2, velocity: planck.Vec2, angle: number, angularVelocity: number) {
        body.setPosition(position);
        body.setLinearVelocity(velocity)
        body.setAngle(angle);
        body.setAngularVelocity(angularVelocity);
    }

    private createPortal(): IPortal {
        const body = this.context.physics.world.createBody({
            type: 'static',
        });
        // Main sensor
        const sensor = body.createFixture({
            shape: planck.Box(0.55, HEIGHT/2 + 0.1, Vec2(-0.45, 0)),
            isSensor: true,
            userData: 'portal'
        });
        body.createFixture({
            shape: planck.Box(0.5, 0.1, Vec2(-0.55, -HEIGHT/2 - 0.1)),
            userData: 'portal-gate'
        });
        body.createFixture({
            shape: planck.Box(0.5, 0.1, Vec2(-0.55, HEIGHT/2 + 0.1)),
            userData: 'portal-gate'
        });

        return {
            body, sensor, normal: Vec2(1, 0)
        };
    }

    private dot(v1: Vec2, v2: Vec2) {
        return v1.x * v2.x + v1.y * v2.y;
    }

    setPortal1(position: Vec2, angle: number) {
        if (!this.portal1) {
            this.portal1 = this.createPortal();
        }
        this.portal1.body.setPosition(position);
        this.portal1.body.setAngle(angle);
        this.portal1.normal = Vec2(Math.cos(angle), Math.sin(angle));
        vec2.set(PortalService.portal1Position, position.x, position.y);
        vec2.set(PortalService.portal1Normal, Math.cos(angle), Math.sin(angle));
    }

    setPortal2(position: Vec2, angle: number) {
        if (!this.portal2) {
            this.portal2 = this.createPortal();
        }
        this.portal2.body.setPosition(position);
        this.portal2.body.setAngle(angle);
        this.portal2.normal = Vec2(Math.cos(angle), Math.sin(angle));
        vec2.set(PortalService.portal2Position, position.x, position.y);
        vec2.set(PortalService.portal2Normal, Math.cos(angle), Math.sin(angle));
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.portal1) {
            this.drawPortal(ctx, this.portal1, '#01f6f2');
        }
        if (this.portal2) {
            this.drawPortal(ctx, this.portal2, '#f5ef04');
        }
        
        if (!this.isDrawing && this.portal1 && this.portal2) {
            this.isDrawing = true;
            this.renderPortalPerspective(this.context.graphics.secondaryCamera, this.portal2, this.portal1);
            this.renderPortalPerspective(this.context.graphics.thirdCamera, this.portal1, this.portal2);
            // ctx.save();
            // ctx.resetTransform();
            // ctx.globalAlpha = 0.5;
            // ctx.drawImage(this.camera.canvas, 0, 0, this.camera.canvas.width, this.camera.canvas.height);
            // ctx.restore();
            this.isDrawing = false;
        }
    }

    private renderPortalPerspective(camera: Camera, dstPortal: IPortal, srcPortal: IPortal) {

        const srcNormal = vec2.fromValues(-srcPortal.normal.x, -srcPortal.normal.y);
        const dstNormal = vec2.fromValues(dstPortal.normal.x, dstPortal.normal.y);
        if (PortalService.isMirror) {
            vec2.mul(dstNormal, dstNormal, vec2.fromValues(-1, 1));
        }
        const angle = Math.atan2(srcNormal[1], srcNormal[0]) - Math.atan2(dstNormal[1], dstNormal[0]);


        // let angle1 = dstPortal.body.getAngle();
        // let angle2 = srcPortal.body.getAngle();

        // if (PortalService.isMirror) {
        //     let vAngle1 = vec2.fromValues(Math.cos(angle1), Math.sin(angle1));
        //     let vAngle2 = vec2.fromValues(Math.cos(angle2), Math.sin(angle2));
        //     let vTemp = vec2.fromValues(vAngle1[0], vAngle1[1]);
        //     angle1 = vec2.angle(vTemp, vec2.fromValues(1, 0));
        //     vTemp = vec2.fromValues(-vAngle2[0], vAngle2[1]);
        //     angle2 = vec2.angle(vTemp, vec2.fromValues(1, 0));
        // }
        
        // // const angle = (PortalService.isMirror ? (angle1 - angle2 + 2 * Math.PI) : (angle1 - angle2 + Math.PI)) % (2 * Math.PI);
        // const angle = (PortalService.isMirror ? (angle1 - angle2 + Math.PI) : (angle1 - angle2 + Math.PI)) % (2 * Math.PI);
        camera.resetTransform();
        mat3.copy(camera.transform, this.context.graphics.getMainCamera().transform);
        camera.translate(srcPortal.body.getPosition().x, srcPortal.body.getPosition().y);
        camera.rotate(angle);
        if (PortalService.isMirror) {
            mat3.scale(camera.transform, camera.transform, vec2.fromValues(-1.0, 1.0));
        }
        camera.translate(-dstPortal.body.getPosition().x, -dstPortal.body.getPosition().y);
        this.context.graphics.render(camera);
    }

    private drawPortal(ctx: CanvasRenderingContext2D, portal: IPortal, color: string) {
        ctx.save();
        ctx.fillStyle = color;
        ctx.translate(portal.body.getPosition().x, portal.body.getPosition().y);
        ctx.rotate(portal.body.getAngle());
        ctx.fillRect(-WIDTH/2, -(HEIGHT - 0.2)/2, WIDTH, (HEIGHT - 0.2));

        // ctx.lineWidth = 0.05;
        // ctx.strokeRect(-1.05, -HEIGHT/2 - 0.2, 1, 0.2);
        // ctx.strokeRect(-1.05, HEIGHT/2, 1, 0.2);
        // ctx.fillStyle = '#ec2';
        // ctx.globalAlpha = 0.4;
        // ctx.fillRect(-1, -HEIGHT/2, 1, HEIGHT);
        // ctx.globalAlpha = 1;
        ctx.restore();
    }
}