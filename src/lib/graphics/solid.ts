import { mat3, mat4, vec3, vec4 } from "gl-matrix";
import { copyTransformToMat4, getUniformLocationOrFail, loadProgram, rigidBodyTransform } from "lib/glutils";
import { Graphics } from "lib/graphics";
import { Sprite } from "./sprite";

export class Solid implements Sprite {

    private static program: WebGLProgram;
    private static colorUniform: WebGLUniformLocation;
    private static modelMatrixUniform: WebGLUniformLocation;
    private static pvMatrixUniform: WebGLUniformLocation;
    private static modelMatrix: mat4;
    private static initialized: boolean = false;
    private static positions: WebGLBuffer;
    private static positionAttribute: number;
    private static tmp3: mat3;

    public modelTransform = mat3.identity(mat3.create());

    zIndex?: number | undefined;

    constructor(
        private readonly gl: WebGLRenderingContext,
        private readonly graphics: Graphics,
        private readonly width: number,
        private readonly height: number,
        public color: vec4
    ) {

        this.initStatic(gl);
    }

    initStatic(gl: WebGLRenderingContext) {
        if (Solid.initialized) {
            return;
        }
        const positionBuffer = gl.createBuffer();
        if (positionBuffer == null) {
            throw new Error('Cant create position buffer');
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const vertexData = new Float32Array([
            -1.0,  1.0,
             1.0,  1.0,
            -1.0, -1.0,
             1.0, -1.0
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
        Solid.modelMatrix = mat4.create();
        Solid.positions = positionBuffer;
        Solid.program = loadProgram(gl, require('lib/shaders/solid.vert.glsl').default, require('lib/shaders/solid.frag.glsl').default);
        Solid.colorUniform = getUniformLocationOrFail(gl, Solid.program, 'uColor');
        Solid.modelMatrixUniform = getUniformLocationOrFail(gl, Solid.program, 'uModel');
        Solid.pvMatrixUniform = getUniformLocationOrFail(gl, Solid.program, 'uPV');
        Solid.positionAttribute = gl.getAttribLocation(Solid.program, 'aVertexPosition');
        Solid.initialized = true;
    }

    draw(): void {
        const gl = this.gl;
        gl.useProgram(Solid.program);
        gl.bindBuffer(gl.ARRAY_BUFFER, Solid.positions);
        gl.vertexAttribPointer(
            Solid.positionAttribute,
            2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(Solid.positionAttribute);
        copyTransformToMat4(Solid.modelMatrix, this.modelTransform);
        // mat4.translate(Solid.modelMatrix, Solid.modelMatrix, this.offset);
        mat4.scale(Solid.modelMatrix, Solid.modelMatrix, vec3.fromValues(this.width / 2, this.height / 2, 1.0));
        gl.uniformMatrix4fv(Solid.modelMatrixUniform, false, Solid.modelMatrix);
        gl.uniformMatrix4fv(Solid.pvMatrixUniform, false, this.graphics.pvMatrix);
        gl.uniform4fv(Solid.colorUniform, this.color);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

}