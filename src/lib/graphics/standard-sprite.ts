import { mat3, mat4, vec3 } from 'gl-matrix';
import { ImageFrame } from 'lib/assets-loader';
import { copyTransformToMat4, getUniformLocationOrFail, loadProgram, rigidBodyTransform } from 'lib/glutils';
import { Graphics } from 'lib/graphics';

import { Sprite, SpriteOptions } from './sprite';

export class StandardSprite implements Sprite {

    public zIndex: number;
    public animationFPS: number;
    public startTime = Date.now();

    public oneShot: boolean;

    public transform = mat3.identity(mat3.create());

    public modelTransform = mat3.identity(mat3.create());

    private static program: WebGLProgram;
    private static positions: WebGLBuffer;
    private static modelMatrixUniform: WebGLUniformLocation;
    private static pvMatrixUniform: WebGLUniformLocation;
    private static positionAttribute: number;
    private static uvAttribute: number;
    private static modelMatrix: mat4;
    private static initialized: boolean = false;
    private static tmp3 = mat3.create();
    private static vertexData: Float32Array;

    private texture: WebGLTexture;
    private offset: vec3;

    constructor(
        private readonly graphics: Graphics,
        private readonly spriteSheet: TexImageSource,
        private width: number,
        private height: number,
        private frames: ReadonlyArray<ImageFrame>,
        options?: Partial<SpriteOptions>
    ) {
        if (frames.length === 0) {
            this.frames = [{
                x: 0, y: 0, w: spriteSheet.width, h: spriteSheet.height
            }];
        }
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
        StandardSprite.vertexData = new Float32Array([
        //    x     y     u     v
            -1.0,  1.0,  0.0,  1.0,
             1.0,  1.0,  1.0,  1.0,
            -1.0, -1.0,  0.0,  0.0,
             1.0, -1.0,  1.0,  0.0
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, StandardSprite.vertexData, gl.STATIC_DRAW);
        StandardSprite.modelMatrix = mat4.create();
        StandardSprite.positions = positionBuffer;
        StandardSprite.program = loadProgram(gl, require('lib/shaders/sprite.vert.glsl').default, require('lib/shaders/sprite.frag.glsl').default);
        StandardSprite.modelMatrixUniform = getUniformLocationOrFail(gl, StandardSprite.program, 'uModel');
        StandardSprite.pvMatrixUniform = getUniformLocationOrFail(gl, StandardSprite.program, 'uPV');
        StandardSprite.positionAttribute = gl.getAttribLocation(StandardSprite.program, 'aVertexPosition');
        StandardSprite.uvAttribute = gl.getAttribLocation(StandardSprite.program, 'aUV');
        StandardSprite.initialized = true;
    }

    public resetAnimation() {
        this.startTime = Date.now();
    }

    draw(): void {
        const timeFrame = Math.round((Date.now() - this.startTime) * this.animationFPS / 1000);

        const frame = this.oneShot ? Math.min(timeFrame, this.frames.length - 1) : timeFrame % this.frames.length;
        const imageFrame = this.frames[frame];
        const top = imageFrame.y / this.spriteSheet.height;
        const bottom = (imageFrame.y + imageFrame.h) / this.spriteSheet.height;
        const left = imageFrame.x / this.spriteSheet.width;
        const right = (imageFrame.x + imageFrame.w) / this.spriteSheet.width;
        StandardSprite.vertexData[2] = left;
        StandardSprite.vertexData[3] = bottom;
        StandardSprite.vertexData[6] = right;
        StandardSprite.vertexData[7] = bottom;
        StandardSprite.vertexData[10] = left;
        StandardSprite.vertexData[11] = top;
        StandardSprite.vertexData[14] = right;
        StandardSprite.vertexData[15] = top;

        const gl = this.graphics.gl;

        gl.useProgram(StandardSprite.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, StandardSprite.positions);
        gl.bufferData(gl.ARRAY_BUFFER, StandardSprite.vertexData, gl.STATIC_DRAW);
        const stride = 4 * Float32Array.BYTES_PER_ELEMENT;
        gl.vertexAttribPointer(
            StandardSprite.positionAttribute,
            2, gl.FLOAT, false, stride, 0);
        gl.enableVertexAttribArray(StandardSprite.positionAttribute);
        gl.vertexAttribPointer(
            StandardSprite.uvAttribute,
            2, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);
        gl.enableVertexAttribArray(StandardSprite.uvAttribute);

        copyTransformToMat4(StandardSprite.modelMatrix, mat3.mul(StandardSprite.tmp3, this.modelTransform, this.transform));
        mat4.translate(StandardSprite.modelMatrix, StandardSprite.modelMatrix, this.offset);
        mat4.scale(StandardSprite.modelMatrix, StandardSprite.modelMatrix, vec3.fromValues(this.width / 2, this.height / 2, 1.0));
        gl.uniformMatrix4fv(StandardSprite.modelMatrixUniform, false, StandardSprite.modelMatrix);
        gl.uniformMatrix4fv(StandardSprite.pvMatrixUniform, false, this.graphics.pvMatrix);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

}
