import { vec2 } from "gl-matrix";

export interface Sprite {
    draw(gl: WebGLRenderingContext): void;
    readonly zIndex?: number;
}

export interface SpriteOptions {
    zIndex: number;
    animationFPS: number;
    oneShot: boolean;
    offset: vec2;
}
