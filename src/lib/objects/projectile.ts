import { vec2 } from "gl-matrix";
import { Physics } from "lib/physics";
import { Sprite } from "lib/sprite";
import { Circle, Vec2 } from "planck-js";
import { GameObject } from "./game-object";
import { Portal } from "./portal";

export interface ProjectileProps {
    position: Vec2;
    direction: Vec2;
    portal: Portal;
    type: 1 | 2;
}

const RADIUS = 0.1;

export const PORTAL_PROJECTILE_CATEGORY = 0x2;

export class Projectile extends GameObject<ProjectileProps> implements Sprite {

    static physicsInitialized = false;
    static toRemove: Projectile[] = [];
    static portalToCreate: Array<{pos: Vec2, normal: Vec2, type: 1 | 2}> = [];

    portal!: Portal;
    type: 1 | 2 = 1;

    private static resolveCollision(self: Projectile, pos: Vec2, normal: Vec2) {
        Projectile.toRemove.push(self);
        Projectile.portalToCreate.push({pos, normal, type: self.type});
    }

    private body = this.context.physics.world.createDynamicBody({
        bullet: true,
        gravityScale: 0
    });

    private color: string = '#000';

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.translate(this.body.getPosition().x, this.body.getPosition().y);
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.ellipse(0, 0, RADIUS, RADIUS, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    zIndex = 3;

    init(props: ProjectileProps) {
        this.type = props.type;
        this.portal = props.portal;
        this.body.createFixture({
            shape: Circle(RADIUS),
            filterCategoryBits: PORTAL_PROJECTILE_CATEGORY,
            filterMaskBits: PORTAL_PROJECTILE_CATEGORY,
            userData: this,
            density: 0.01
        });
        this.color = props.type === 1 ? '#01f6f2' : '#f5ef04';
        this.body.setPosition(props.position);
        this.body.setLinearVelocity(props.direction);
        this.context.graphics.addSprite(this);

        if (!Projectile.physicsInitialized) {
            Projectile.physicsInitialized = true;
            this.context.physics.world.on('pre-solve', (contact, oldManifold) => {
                const fA = contact.getFixtureA();
                const fB = contact.getFixtureB();
                const userA = fA.getUserData();
                const userB = fB.getUserData();
                const manifold = contact.getWorldManifold(null);
                if (manifold == null || manifold.points.length < 1) {
                    return;
                }
                const point = manifold.points[0];
                const normal = manifold.normal;
                if (userA instanceof Projectile) {
                    Projectile.resolveCollision(userA, point, normal);
                } else if (userB instanceof Projectile) {
                    Projectile.resolveCollision(userB, point, normal);
                }
            });
            this.on('after-physics', () => {
                for (const toRemove of Projectile.toRemove) {
                    this.context.physics.world.destroyBody(toRemove.body);
                    this.context.graphics.removeSprite(toRemove);
                }
                Projectile.toRemove.length = 0;

                for (const portal of Projectile.portalToCreate) {
                    if (portal.type === 1) {
                        this.portal.setPortal1(portal.pos, portal.normal);
                    } else {
                        this.portal.setPortal2(portal.pos, portal.normal);
                    }
                }
                Projectile.portalToCreate.length = 0;
            });
        }

    }

}