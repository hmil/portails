import { Graphics } from './graphics';
import { Crosshair } from './objects/crosshair';

import { PlayerCharacter } from './objects/player-character';
import { Physics } from './physics';
import { GameWorld } from './game-world';
import * as planck from 'planck-js';
import { Vec2 } from 'planck-js';
import { IPortal, Portal } from './objects/portal';


export class Controller {

    private keys = {
        up: 0,
        down: 0,
        left: 0,
        right: 0
    };

    private player = new PlayerCharacter();
    private crosshair = new Crosshair();
    private portal = new Portal();

    private toTeleport: Array<{ body: planck.Body, nextPos: Vec2, nextSpeed: Vec2, nextAngle: number}> = [];

    constructor(world: GameWorld, private readonly physics: Physics, private readonly graphics: Graphics) {
        world.addObject(this.player);
        world.addObject(this.crosshair);
        world.addObject(this.portal);
        window.addEventListener('keydown', this.onKeydown);
        window.addEventListener('keyup', this.onKeyUp);
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mousedown', this.onMouseDown);

        physics.world.on('pre-solve', (contact, oldManifold) => {
            const contactPoint = contact.getWorldManifold(null)?.points[0];
            if (contactPoint == null) {
                return;
            }

            const p1 = this.portal.getP1();
            const p2 = this.portal.getP2();
            if (p1 && p2) {
                const fixture = contact.getFixtureA().getBody().isStatic() ? contact.getFixtureB() : contact.getFixtureA();
                if (this.checkPortal(p1, p2, contactPoint, fixture) || this.checkPortal(p2, p1, contactPoint, fixture)) {
                    contact.setEnabled(false);
                }
            }
        });
    }

    private checkPortal(portal: IPortal, other: IPortal, contactPoint: Vec2, fixture: planck.Fixture): boolean {
        if (portal.pos.clone().sub(contactPoint).length() < 1) {
            // Get the dynamic fixture in contact
            const bodyPos = fixture.getBody().getPosition();
    
            // Check if body is past portal plane
            const projection = this.dot(bodyPos.clone().sub(portal.pos.clone()), portal.normal.clone());
            if (projection < 0) {
                const nextPos = other.normal.clone().mul(-projection).add(other.pos.clone());


                const p1Angle = Math.atan2(portal.normal.y, portal.normal.x);
                const p2Angle = Math.atan2(other.normal.y, other.normal.x);
                const angle = (p2Angle - p1Angle + Math.PI) % (2 * Math.PI);

                const isMirror = false; //Math.abs(angle) >= Math.PI / 2;
                const nextAngle = angle + fixture.getBody().getAngle() - (isMirror ? Math.PI : 0);
                console.log(angle);


                const speed = fixture.getBody().getLinearVelocity();
                const speedNormal = this.dot(speed, portal.normal);
                const speedTangent = this.dot(speed, Vec2(-portal.normal.y, portal.normal.x));

                const nextNormal = other.normal.clone().mul(-speedNormal);
                const nextTangent = Vec2(-other.normal.y, other.normal.x).mul(isMirror ? speedTangent : -speedTangent);
                const nextSpeed = Vec2(nextNormal.x + nextTangent.x, nextNormal.y + nextTangent.y);

                // const rotation = Vec2(Math.cos(angle), Math.sin(angle));
                // const nextSpeed = Vec2(speed.x * rotation.x - speed.y * rotation.y, speed.x * rotation.y + speed.y * rotation.x);


                this.toTeleport.push({body: fixture.getBody(), nextPos, nextSpeed, nextAngle });
            }

            return true;
        }
        return false;
    }

    private dot(v1: Vec2, v2: Vec2) {
        return v1.x * v2.x + v1.y * v2.y;
    }

    public update() {
        if (this.player.body == null) {
            return;
        }

        for (let i = 0 ; i < this.toTeleport.length ; i++) {
            const { body, nextPos, nextSpeed, nextAngle } = this.toTeleport[i];
            body.setPosition(nextPos);
            body.setLinearVelocity(nextSpeed)
            body.setAngle(nextAngle);
        }

        const playerAngle = this.player.body.getAngle();
        if (playerAngle != 0) {
            if (Math.abs(playerAngle) < 0.1) {
                this.player.body.setAngle(0);
            } else {
                this.player.body.setAngle(this.player.body.getAngle() - 0.1 * Math.sign(this.player.body.getAngle()));
            }
        }
        this.toTeleport.length = 0;
        const direction = this.keys.right - this.keys.left;
        if (this.isPlayerTouchingTheGround(this.player.body)) {
            const v = this.player.body?.getLinearVelocity();
            const force = planck.Vec2(-v.x * 1, -this.keys.up * 300); // Breaking force + jump
            
            if (direction != 0) {
                force.x += direction * 20; // Moving force
            }
            
            this.player.body.applyForce(force, this.player.body.getPosition(), true);
            // Body.applyForce(this.player.body, this.player.body.position, force);
        }

        if (direction != 0) {
            this.player.setDirection(direction > 0 ? 'right' : 'left');
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

    private onMouseMove = (evt: MouseEvent) => {
        // const [x, y] = this.graphics.mapToWorldCoordinates(evt.clientX, evt.clientY);
        // this.crosshair.setPosition(x, y);
    };

    private onMouseDown = (evt: MouseEvent) => {

        evt.preventDefault();
        evt.stopPropagation();

        if (this.player.body == null) {
            return;
        }

        const [x, y] = this.graphics.mapToWorldCoordinates(evt.clientX, evt.clientY);

        const playerPos = this.player.body.getPosition();


        const direction = planck.Vec2(x - playerPos.x, y - playerPos.y);
        direction.normalize();
        const start = playerPos.clone().add(direction);
        const end = playerPos.clone().add(direction.mul(100));

        let f = 1;
        this.physics.world.rayCast(start, end, (fixture, point, normal, fraction) => {
            if (fraction < f) {
                const position = Vec2(point.x, point.y);
                console.log(normal);
                if (evt.button === 0) {
                    this.portal.setPortal1({pos: position, normal});
                } else if (evt.button === 2) {
                    this.portal.setPortal2({pos: position, normal});
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