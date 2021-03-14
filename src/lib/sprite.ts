import { mat3, mat4, vec2, vec3 } from "gl-matrix";
import { ImageFrame, ImageSprite } from "./assets-loader";
import { copyTransformToMat4, getUniformLocationOrFail, loadProgram, rigidBodyTransform } from "./glutils";
import { Graphics } from "./graphics";

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

export class StandardSprite implements Sprite {

    public zIndex: number;
    public animationFPS: number;
    public startTime = Date.now();

    public oneShot: boolean;

    public transform = mat3.identity(mat3.create());

    private static program: WebGLProgram;
    private static positions: WebGLBuffer;
    private static modelMatrixUniform: WebGLUniformLocation;
    private static pvMatrixUniform: WebGLUniformLocation;
    private static positionAttribute: number;
    private static modelMatrix: mat4;
    private static initialized: boolean = false;
    private static tmp3 = mat3.create();

    private texture: WebGLTexture;
    private offset: vec3;

    constructor(
        private readonly graphics: Graphics,
        public body: planck.Body,
        private readonly spriteSheet: TexImageSource,
        private width: number,
        private height: number,
        private readonly frames: ReadonlyArray<ImageFrame>,
        options?: Partial<SpriteOptions>
    ) {
        this.zIndex = options?.zIndex ?? 0;
        this.animationFPS = options?.animationFPS ?? 60;
        this.oneShot = options?.oneShot ?? false;
        this.offset = vec3.fromValues(options?.offset?.[0] ?? 0, options?.offset?.[1] ?? 0, 0);

        const gl = graphics.gl;

        this.initStatic(gl);
        const texture = gl.createTexture();
        if (texture == null) {
            throw new Error('Failed to create texture');
        }
        this.texture = texture;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, spriteSheet);
    }

    initStatic(gl: WebGLRenderingContext) {
        if (StandardSprite.initialized) {
            return;
        }
        const positionBuffer = gl.createBuffer();
        if (positionBuffer == null) {
            throw new Error('Cant create position buffer');
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1.0,  1.0,
            1.0,  1.0,
            -1.0, -1.0,
            1.0, -1.0,
        ]), gl.STATIC_DRAW);
        StandardSprite.modelMatrix = mat4.create();
        StandardSprite.positions = positionBuffer;
        StandardSprite.program = loadProgram(gl, require('./shaders/sprite.vert.glsl').default, require('./shaders/sprite.frag.glsl').default);
        StandardSprite.modelMatrixUniform = getUniformLocationOrFail(gl, StandardSprite.program, 'uModel');
        StandardSprite.pvMatrixUniform = getUniformLocationOrFail(gl, StandardSprite.program, 'uPV');
        StandardSprite.initialized = true;
    }

    public resetAnimation() {
        this.startTime = Date.now();
    }

    draw(gl: WebGLRenderingContext): void {
        // const timeFrame = Math.round((Date.now() - this.startTime) * this.animationFPS / 1000);

        // const frame = this.oneShot ? Math.min(timeFrame, this.imageSequence.length - 1) : timeFrame % this.imageSequence.length;
        // const pos = this.body.getPosition();
        // ctx.translate(pos.x, pos.y);
        // ctx.rotate(this.body.getAngle());
        // ctx.transform(this.transform[0], this.transform[1],this.transform[3],this.transform[4],this.transform[6],this.transform[7]);
        // this.imageSequence[frame].draw(ctx, -this.width / 2, -this.height / 2, this.width, this.height);

        gl.useProgram(StandardSprite.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, StandardSprite.positions);
        gl.vertexAttribPointer(
            StandardSprite.positionAttribute,
            2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(StandardSprite.positionAttribute);

        copyTransformToMat4(StandardSprite.modelMatrix, mat3.mul(StandardSprite.tmp3, rigidBodyTransform(StandardSprite.tmp3, this.body), this.transform));
        mat4.translate(StandardSprite.modelMatrix, StandardSprite.modelMatrix, this.offset);
        mat4.scale(StandardSprite.modelMatrix, StandardSprite.modelMatrix, vec3.fromValues(this.width / 2, this.height / 2, 1.0));
        // mat4.fromTranslation(StandardSprite.modelMatrix, vec3.fromValues(0.0, 0.0, -this.zIndex / 10))
        gl.uniformMatrix4fv(StandardSprite.modelMatrixUniform, false, StandardSprite.modelMatrix);
        gl.uniformMatrix4fv(StandardSprite.pvMatrixUniform, false, this.graphics.pvMatrix);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

}