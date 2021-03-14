import { Sprite } from 'lib/sprite';
import { Chain, Circle, Contact, Edge, Shape, Vec2 } from 'planck-js';

import { GameObject } from './game-object';
import { Portal } from './portal';

export interface ProjectileProps {
    position: Vec2;
    direction: Vec2;
    portal: Portal;
    type: 1 | 2;
}

const RADIUS = 0.1;

// Minimum distance from end of edge to portal center
const KEEPOFF = 1;
// To negate rounding errors
const PRECISION = 0.001;

export const PORTAL_PROJECTILE_CATEGORY = 0x2;

export class Projectile extends GameObject<ProjectileProps> implements Sprite {

    static physicsInitialized = false;
    static toRemove: Projectile[] = [];
    static portalToCreate: Array<{pos: Vec2, normal: Vec2, type: 1 | 2}> = [];

    portal!: Portal;
    type: 1 | 2 = 1;

    private static resolveCollision(self: Projectile, pos: Vec2, normal: Vec2, create: boolean) {
        Projectile.toRemove.push(self);
        if (create) {
            Projectile.portalToCreate.push({pos, normal, type: self.type});
        }
    }

    private body = this.context.physics.world.createDynamicBody({
        bullet: true,
        gravityScale: 0
    });

    private color: string = '#000';

    draw(gl: WebGLRenderingContext): void {
        // ctx.translate(this.body.getPosition().x, this.body.getPosition().y);
        // ctx.beginPath();
        // ctx.fillStyle = this.color;
        // ctx.ellipse(0, 0, RADIUS, RADIUS, 0, 0, Math.PI * 2);
        // ctx.fill();
    }

    zIndex = 3;

    private resolveFixtures(contact: Contact) {
        const fA = contact.getFixtureA();
        const fB = contact.getFixtureB();
        const manifold = contact.getWorldManifold(null);
        if (manifold == null || manifold.points.length < 1) {
            return;
        }

        const point = manifold.points[0];
        const normal = manifold.normal;

        const userA = fA.getUserData();
        const userB = fB.getUserData();
        if (userA instanceof Projectile) {
            return { point, normal: normal.mul(-1), fixture: fB, projectile: userA };
        } else if (userB instanceof Projectile) {
            return { point, normal, fixture: fA, projectile: userB };
        }
    }

    private correctImpactPoint(point: Vec2, end: Vec2, tangent: Vec2): Vec2 {
        const distance = point.clone().sub(end).length();
        if (distance < KEEPOFF) {
            return point.add(tangent.clone().mul(KEEPOFF - distance));
        }
        return point;
    }

    private correctImpactNormal(normal: Vec2, tangent: Vec2) {
        const newNormal = Vec2(tangent.y, tangent.x);
        if (this.dot(normal, newNormal) < 0) {
            return newNormal.mul(-1);
        }
        return newNormal;
    }

    private getBounds(contact: Contact, shape: Shape): [Vec2, Vec2] | null {
        if (shape.m_type === 'chain') {
            const edge = new Edge(Vec2(0,0), Vec2(0,0));
            (shape as Chain).getChildEdge(edge, contact.getChildIndexA());

            return [edge.m_vertex1, edge.m_vertex2]
        }
        return null;
    }

    private dot(v1: Vec2, v2: Vec2) {
        return v1.x * v2.x + v1.y * v2.y;
    }

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
                const resolved = this.resolveFixtures(contact);
                if (resolved == null) {
                    return;
                }
                const shape = resolved.fixture.getShape();
                const bounds = this.getBounds(contact, shape);
                let point = resolved.point;
                let normal = resolved.normal;
                if (bounds != null) {
                    const tangent = bounds[1].clone().sub(bounds[0]);
                    tangent.normalize();
                    normal = this.correctImpactNormal(normal, tangent);

                    point = this.correctImpactPoint(point, bounds[0], tangent);
                    point = this.correctImpactPoint(point, bounds[1], tangent.mul(-1));
                    const remaining = point.clone().sub(bounds[0]).length();
                    if (KEEPOFF - remaining > PRECISION) {
                        console.log('abort');
                        Projectile.resolveCollision(resolved.projectile, point, normal, false);
                        return;
                    }
                }
                Projectile.resolveCollision(resolved.projectile, point, normal, true);
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