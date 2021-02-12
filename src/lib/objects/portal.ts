import { Sprite } from "lib/graphics";
import * as planck from "planck-js";
import { Vec2 } from "planck-js";
import { GameObject } from "./game-object";

const WIDTH = 1;
const HEIGHT = 0.2;

export interface IPortal {
    pos: Vec2;
    normal: Vec2;
}

export class Portal implements GameObject {

    public readonly sprite: Sprite = this;
    public body?: planck.Body;

    private p1?: Vec2;
    private p1Normal = Vec2();
    private p2?: Vec2;
    private p2Normal = Vec2();

    setPortal1(portal: IPortal) {
        this.p1 = portal.pos.clone();
        this.p1Normal = portal.normal.clone();
    }
    
    setPortal2(portal: IPortal) {
        this.p2 = portal.pos.clone();
        this.p2Normal = portal.normal.clone();
    }

    getP1(): IPortal | void {
        if (this.p1) {
            return { pos: this.p1.clone() ?? Vec2(), normal: this.p1Normal.clone() };
        }
    }

    getP2(): IPortal | void {
        if (this.p2) {
            return { pos: this.p2.clone() ?? Vec2(), normal: this.p2Normal.clone() };
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        if (this.p1) {
            this.drawPortal(ctx, this.p1, Math.atan2(this.p1Normal.y, this.p1Normal.x), '#01f6f2');
        }
        if (this.p2) {
            this.drawPortal(ctx, this.p2, Math.atan2(this.p2Normal.y, this.p2Normal.x), '#f5ef04');
        }
    }

    private drawPortal(ctx: CanvasRenderingContext2D, position: Vec2, angle: number, color: string) {
        ctx.save();
        ctx.fillStyle = color;
        ctx.translate(position.x, position.y);
        ctx.rotate(angle + Math.PI / 2);
        ctx.fillRect(-WIDTH/2, -HEIGHT/2, WIDTH, HEIGHT);
        ctx.restore();
    }
}