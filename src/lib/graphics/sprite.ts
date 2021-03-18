import { mat3, vec2 } from "gl-matrix";

export interface Sprite {
    modelTransform: mat3;
    draw(): void;
    readonly zIndex?: number;
}

export interface SpriteOptions {
    zIndex: number;
    animationFPS: number;
    oneShot: boolean;
    offset: vec2;
}
