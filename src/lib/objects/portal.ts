import { vec2 } from "../gl-matrix";
import { Camera, SCREEN_HEIGHT, SCREEN_WIDTH } from "lib/graphics";
import { PortalService } from "lib/PortalService";
import * as planck from "planck-js";
import { Transform, Vec2 } from "planck-js";
import { GameObject, Portalizable } from "./game-object";

const WIDTH = 0.2;
const HEIGHT = 2;

export interface IPortal {
    body: planck.Body;
    sensor: planck.Fixture;
    normal: Vec2;
}

interface PortalData {
    teleportArray: Array<{ body: planck.Body, nextPos: Vec2, nextSpeed: Vec2, nextAngle: number}>
}

export class Portal extends GameObject<PortalData> {

    public body?: planck.Body;

    private portal1?: IPortal;
    private portal2?: IPortal;

    readonly zIndex = 1;

    private teleportArray: Array<{ body: planck.Body, nextPos: Vec2, nextSpeed: Vec2, nextAngle: number}> = [];

    private portalingFixtures = new Map<planck.Fixture, IPortal>();

    private isDrawing = false;

    init({teleportArray}: PortalData) {
        this.graphics.addSprite(this);
        this.teleportArray = teleportArray;

        this.world.on('begin-contact', (contact) => {
            if (contact.getFixtureA().getUserData() === 'portal' && contact.getFixtureA().getBody() === this.portal1?.body) {
                this.portalingFixtures.set(contact.getFixtureB(), this.portal1);
            } else if (contact.getFixtureA().getUserData() === 'portal' && contact.getFixtureA().getBody() === this.portal2?.body) {
                this.portalingFixtures.set(contact.getFixtureB(), this.portal2);
            } else if (contact.getFixtureB().getUserData() === 'portal' && contact.getFixtureB().getBody() === this.portal1?.body) {
                this.portalingFixtures.set(contact.getFixtureA(), this.portal1);
            } else if (contact.getFixtureB().getUserData() === 'portal' && contact.getFixtureB().getBody() === this.portal2?.body) {
                this.portalingFixtures.set(contact.getFixtureA(), this.portal2);
            } 
        });
        this.world.on('end-contact', (contact) => {
            if (contact.getFixtureA().getUserData() === 'portal' && 
                (contact.getFixtureA().getBody() === this.portal1?.body || contact.getFixtureA().getBody() === this.portal2?.body)) {
                console.log('remove B');
                (contact.getFixtureB().getBody().getUserData() as Portalizable).surrogate.active = false;
                this.portalingFixtures.delete(contact.getFixtureB());
            } else if (contact.getFixtureB().getUserData() === 'portal' && 
            (contact.getFixtureB().getBody() === this.portal1?.body || contact.getFixtureB().getBody() === this.portal2?.body)) {
                console.log('remove A');
                (contact.getFixtureA().getBody().getUserData() as Portalizable).surrogate.active = false;
                this.portalingFixtures.delete(contact.getFixtureA());
            } 
        });

        this.world.on('pre-solve', (contact, oldManifold) => {
            const contactPoints = contact.getWorldManifold(null)?.points;
            if (contactPoints == null) {
                return;
            }

            if (this.portal1 && this.portal2) {
                const wall = contact.getFixtureA().getBody().isStatic() ? contact.getFixtureA() : contact.getFixtureA();
                if (wall.getUserData() === 'portal-gate') {
                    return;
                }
                for (const contactPoint of contactPoints) {
                    if (this.portal1.sensor.getShape().testPoint(this.portal1.body.getTransform(), contactPoint)) {
                        contact.setEnabled(false);
                        return;
                    }
                    if (this.portal2.sensor.getShape().testPoint(this.portal2.body.getTransform(), contactPoint)) {
                        contact.setEnabled(false);
                        return;
                    }
                }
            }
        });

        requestAnimationFrame(this.update);
    }

    private update = () => {
        for (const [fixture, portal] of this.portalingFixtures) {
            const otherPortal = (this.portal1 === portal) ? this.portal2 : this.portal1;
            if (otherPortal == null) {
                return;
            }
            const surrogate = (fixture.getBody().getUserData() as Portalizable).surrogate;
            if (!surrogate.active) {
                console.log('adding sprite');
                this.graphics.addSprite(surrogate.sprite);
                surrogate.active = true;
            }
            const portalTangent = Vec2(-portal.normal.y, portal.normal.x);
            const bodyPos = fixture.getBody().getPosition();
            const relativeBodyPos = bodyPos.clone().sub(portal.body.getPosition().clone());
            const primaryDisplacement = this.dot(relativeBodyPos, portal.normal);
            const tangentDisplacement = this.dot(relativeBodyPos, portalTangent);
            const primaryVelocity = this.dot(fixture.getBody().getLinearVelocity(), portal.normal);
            const tangentVelocity = this.dot(fixture.getBody().getLinearVelocity(), portalTangent);

            const angle = (otherPortal.body.getAngle() - portal.body.getAngle() + Math.PI) % (2 * Math.PI);

            const otherTangent = Vec2(-otherPortal.normal.y, otherPortal.normal.x);
            const nextPos = otherPortal.normal.clone().mul(-primaryDisplacement).add(otherTangent.mul(-tangentDisplacement)).add(otherPortal.body.getPosition().clone());
            const nextAngle = angle + fixture.getBody().getAngle();
            const nextSpeed = otherPortal.normal.clone().mul(-primaryVelocity).add(otherTangent.clone().mul(tangentVelocity));
            if (primaryDisplacement < 0) {
                this.teleportArray.push({body: fixture.getBody(), nextPos, nextSpeed, nextAngle });
            } else {
                this.teleportArray.push({ body: surrogate.body, nextPos, nextSpeed, nextAngle});
            }
        }
        requestAnimationFrame(this.update);
    }

    private createPortal(): IPortal {
        const body = this.world.createBody({
            type: 'static',
        });
        // Main sensor
        const sensor = body.createFixture({
            shape: planck.Box(0.55, HEIGHT/2 + 0.1, Vec2(-0.45, 0)),
            isSensor: true,
            userData: 'portal'
        });
        body.createFixture({
            shape: planck.Box(0.5, 0.2, Vec2(-0.55, -HEIGHT/2 - 0.1)),
            userData: 'portal-gate'
        });
        body.createFixture({
            shape: planck.Box(0.5, 0.2, Vec2(-0.55, HEIGHT/2 + 0.1)),
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
            this.renderPortalPerspective(this.graphics.secondaryCamera, this.portal2, this.portal1);
            this.renderPortalPerspective(this.graphics.thirdCamera, this.portal1, this.portal2);
            // ctx.save();
            // ctx.resetTransform();
            // ctx.globalAlpha = 0.5;
            // ctx.drawImage(this.camera.canvas, 0, 0, this.camera.canvas.width, this.camera.canvas.height);
            // ctx.restore();
            this.isDrawing = false;
        }
    }

    private renderPortalPerspective(camera: Camera, p1: IPortal, p2: IPortal) {
        const angle = (p1.body.getAngle() - p2.body.getAngle() + Math.PI) % (2 * Math.PI);
        camera.resetTransform();
        camera.transform = this.graphics.getMainCamera().transform;            
        camera.translate(-p2.body.getPosition().x, -p2.body.getPosition().y);
        camera.rotate(angle);
        camera.translate(p1.body.getPosition().x, p1.body.getPosition().y);
        this.graphics.render(camera);
    }

    private drawPortal(ctx: CanvasRenderingContext2D, portal: IPortal, color: string) {
        ctx.save();
        ctx.fillStyle = color;
        ctx.translate(portal.body.getPosition().x, portal.body.getPosition().y);
        ctx.rotate(portal.body.getAngle());
        ctx.fillRect(-WIDTH/2, -HEIGHT/2, WIDTH, HEIGHT);

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