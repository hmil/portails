import { Assets } from "./assets";

export interface Sprite {
    draw(ctx: CanvasRenderingContext2D, assets: Assets): void;
    readonly zIndex?: number;
}