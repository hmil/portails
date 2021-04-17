import { Sprite } from "./graphics/sprite";
import { mat3, mat4, vec2, vec3 } from 'gl-matrix';
import { PortalService } from "./PortalService";
import { loadProgram } from "./glutils";

export const SCREEN_WIDTH = 20;
export const SCREEN_HEIGHT = 9;

const PERLIN_SIZE = 64;

export class Camera {

    public readonly pvMatrix: mat4 = mat4.create();
    public readonly transform: mat3 = mat3.create();
    private angle: number = 0;

    constructor(public readonly gl: WebGLRenderingContext,
                public readonly buffer: WebGLFramebuffer,
                public readonly texture: WebGLTexture) { }

    public resetTransform() {
        mat3.identity(this.transform);
        this.angle = 0;
    }

    public translate(dx: number, dy: number) {
        mat3.translate(this.transform, this.transform, vec2.fromValues(dx, dy));
    }

    public getAngle() {
        return this.angle;
    }

    public rotate(alpha: number) {
        this.angle = alpha;
        mat3.rotate(this.transform, this.transform, alpha);
    }
}

export class Graphics {

    public readonly gl: WebGLRenderingContext;
    private readonly el: HTMLCanvasElement;

    private displayMatrix = mat3.create();

    private width = 0;
    private height = 0;
    private pixelRatio = 1;

    private sprites: Sprite[][] = [];

    public pvMatrix = mat4.create();

    private cameras: Camera[] = [];

    private buffers: { [k: string]: WebGLBuffer };
    private programInfo: {
        program: WebGLProgram;
        attribLocations: {
            vertexPosition: number;
            screenPosition: number;
        };
        uniformLocations: {
            uSampler: WebGLUniformLocation;
            uSecondCamera: WebGLUniformLocation;
            uThirdCamera: WebGLUniformLocation;
            portal1Origin: WebGLUniformLocation;
            portal1Normal: WebGLUniformLocation;
            portal2Origin: WebGLUniformLocation;
            portal2Normal: WebGLUniformLocation;
            uScreenSize: WebGLUniformLocation;
            uViewMatrix: WebGLUniformLocation;
            uTime: WebGLUniformLocation;
            uPerlinNoise: WebGLUniformLocation;
            uCharacterPos: WebGLUniformLocation;
        };
    };
    private perlinTexture: WebGLTexture;

    private perlinNoise: Uint32Array = this.createPerlinNoise();

    constructor() {
        this.el = document.createElement('canvas');
        this.el.addEventListener('contextmenu', event => event.preventDefault());
        // this.el.style.width = '100%';
        // this.el.style.height = '100%';
        const gl = this.el.getContext('webgl');
        if (gl == null) {
            throw new Error('Canvas not supported in this browser');
        }
        this.gl = gl;
        document.getElementById('app')!.append(this.el);
        this.resizeCanvasToDisplaySize();

        // Init shader program
        const shaderProgram = loadProgram(gl, require('./shaders/post.vert.glsl').default, require('./shaders/post.frag.glsl').default);

        this.programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                screenPosition: gl.getAttribLocation(shaderProgram, 'aScreenPosition'),
            },
            uniformLocations: {
                uSampler: gl.getUniformLocation(shaderProgram, 'uSampler')!,
                uSecondCamera: gl.getUniformLocation(shaderProgram, 'uSecondaryCamera')!,
                uThirdCamera: gl.getUniformLocation(shaderProgram, 'uThirdCamera')!,
                portal1Origin: gl.getUniformLocation(shaderProgram, 'uPortal1Origin')!,
                portal1Normal: gl.getUniformLocation(shaderProgram, 'uPortal1Normal')!,
                portal2Origin: gl.getUniformLocation(shaderProgram, 'uPortal2Origin')!,
                portal2Normal: gl.getUniformLocation(shaderProgram, 'uPortal2Normal')!,
                uScreenSize: gl.getUniformLocation(shaderProgram, 'uScreenSize')!,
                uViewMatrix: gl.getUniformLocation(shaderProgram, 'uViewMatrix')!,
                uTime: gl.getUniformLocation(shaderProgram, 'uTime')!,
                uPerlinNoise: gl.getUniformLocation(shaderProgram, 'uPerlinNoise')!,
                uCharacterPos: gl.getUniformLocation(shaderProgram, 'uCharacterPos')!,
            },
        };

        const positionBuffer = gl.createBuffer();
        if (positionBuffer == null) {
            throw new Error('Cant create position buffer');
        }

        // Select the positionBuffer as the one to apply buffer
        // operations to from here out.

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // Now create an array of positions for the square.

        const positions = [
            -1.0,  1.0,
            1.0,  1.0,
            -1.0, -1.0,
            1.0, -1.0,
        ];

        // Now pass the list of positions into WebGL to build the
        // shape. We do this by creating a Float32Array from the
        // JavaScript array, then use it to fill the current buffer.

        gl.bufferData(gl.ARRAY_BUFFER,
                        new Float32Array(positions),
                        gl.STATIC_DRAW);

        this.buffers = { position: positionBuffer };

        this.perlinTexture = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, this.perlinTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, PERLIN_SIZE, PERLIN_SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(this.perlinNoise.buffer));
    }

    private createPerlinNoise(): Uint32Array {
        const v = vec3.create();
        const buffer = new Uint32Array(PERLIN_SIZE * PERLIN_SIZE);
        for (let i = 0 ; i < PERLIN_SIZE * PERLIN_SIZE ; i++) {
            vec3.random(v);
            buffer[i] = (((v[0] * 128 + 128) & 0xff) << 0) + (((v[1] * 128 + 128) & 0xff) << 8) + (((v[2] * 128 + 128) & 0xff) << 16);
        }
        return buffer;
    }

    public addSprite(sprite: Sprite): void {
        const z = sprite.zIndex ?? 1;

        if (this.sprites.length <= z) {
            for (let i = this.sprites.length ; i <= z ; i++) {
                this.sprites[i] = [];
            }
        }

        const bucket = this.sprites[z];
        bucket.push(sprite);
    }

    public removeSprite(sprite: Sprite): void {
        const z = sprite.zIndex ?? 1;
        const bucket = this.sprites[z];
        if (bucket) {
            const idx = bucket.indexOf(sprite);
            if (idx >= 0) {
                bucket.splice(idx, 1);
            }
        }
    }

    public mapToWorldCoordinates(clientX: number, clientY: number) {
        const br = this.el.parentElement!.getBoundingClientRect();
        clientX -= br.x;
        clientY -= br.y;
        const invertMatrx = mat3.multiply(mat3.create(), this.displayMatrix, this.cameras[0].transform);
        mat3.invert(invertMatrx, invertMatrx);
        const coords = vec2.fromValues(clientX, clientY);
        vec2.scale(coords, coords, this.pixelRatio);
        return vec2.transformMat3(coords, coords, invertMatrx);
    }

    public createCamera(): Camera {
        const gl = this.gl;
        const buffer = gl.createFramebuffer();
        const renderTexture = gl.createTexture();
        if (buffer == null || renderTexture == null) {
            throw new Error('Could not create render buffer or texture.');
        }
        gl.bindTexture(gl.TEXTURE_2D, renderTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, renderTexture, 0);
        const cam = new Camera(this.gl, buffer, renderTexture);
        this.cameras.push(cam);
        return cam;
    }

    public draw() {
        this.resizeCanvasToDisplaySize();
        for (const camera of this.cameras) {
            this.render(camera);
        }

        // const gl = this.gl;
        // // Set clear color to black, fully opaque
        // gl.clearColor(0.0, 0.0, 0.0, 1.0);

        // gl.enable(gl.DEPTH_TEST);           // Enable depth testing
        // gl.depthFunc(gl.LEQUAL);
        const gl = this.gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.clearDepth(1.0);                 // Clear everything
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create();

        // note: glmatrix.js always has the first argument
        // as the destination to receive the result.
        mat4.ortho(projectionMatrix, -1, 1, -1, 1, zNear, zFar);

        // Set the drawing position to the "identity" point, which is
        // the center of the scene.
        const modelViewMatrix = mat4.create();

        // Now move the drawing position a bit to where we want to
        // start drawing the square.

        mat4.translate(modelViewMatrix,     // destination matrix
                        modelViewMatrix,     // matrix to translate
                        [0.0, 0.0, -2.0]);  // amount to translate


        // Tell WebGL how to pull out the positions from the position
        // buffer into the vertexPosition attribute.
        {
            const numComponents = 2;  // pull out 2 values per iteration
            const type = gl.FLOAT;    // the data in the buffer is 32bit floats
            const normalize = false;  // don't normalize
            const stride = 0;         // how many bytes to get from one set of values to the next
                                    // 0 = use type and numComponents above
            const offset = 0;         // how many bytes inside the buffer to start from
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
            gl.vertexAttribPointer(
                this.programInfo.attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            gl.enableVertexAttribArray(
                this.programInfo.attribLocations.vertexPosition);
        }

        // Tell WebGL to use our program when drawing
        gl.useProgram(this.programInfo.program);

        const [mainCamera, secondCamera, thirdCamera] = this.cameras;

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, mainCamera.texture);
        gl.uniform1i(this.programInfo.uniformLocations.uSecondCamera, 0);
        if (secondCamera) {
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, secondCamera.texture);
            gl.uniform1i(this.programInfo.uniformLocations.uSecondCamera, 1);
        }
        if (thirdCamera) {
            gl.activeTexture(gl.TEXTURE2);
            gl.bindTexture(gl.TEXTURE_2D, thirdCamera.texture);
            gl.uniform1i(this.programInfo.uniformLocations.uThirdCamera, 2);
        }
    
        gl.uniform2f(this.programInfo.uniformLocations.portal1Normal, PortalService.portal1Normal[0], PortalService.portal1Normal[1]);
        gl.uniform2f(this.programInfo.uniformLocations.portal1Origin, PortalService.portal1Position[0], PortalService.portal1Position[1]);
        gl.uniform2f(this.programInfo.uniformLocations.portal2Normal, PortalService.portal2Normal[0], PortalService.portal2Normal[1]);
        gl.uniform2f(this.programInfo.uniformLocations.portal2Origin, PortalService.portal2Position[0], PortalService.portal2Position[1]);
        gl.uniform1f(this.programInfo.uniformLocations.uTime, Date.now() % 16000);
        gl.uniform2f(this.programInfo.uniformLocations.uCharacterPos, PortalService.playerPos[0], PortalService.playerPos[1]);

        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, this.perlinTexture);
        gl.uniform1i(this.programInfo.uniformLocations.uPerlinNoise, 3);

        const view = mat4.create();
        // mat3.mul(view, this.displayMatrix, transform);
        if (!mat4.invert(view, mainCamera.pvMatrix)) {
            throw new Error('Cant inverse matrix');
        }
        gl.uniformMatrix4fv(this.programInfo.uniformLocations.uViewMatrix, false, view);

        gl.uniform2f(this.programInfo.uniformLocations.uScreenSize, this.width, this.height);

        {
            const offset = 0;
            const vertexCount = 4;
            gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
        }
    }

    public render(camera: Camera): void {
        const transform = camera.transform;
        const view = mat3.create();

        const ratioX = this.width / SCREEN_WIDTH;
        const ratioY = this.height / SCREEN_HEIGHT;
        if (ratioX < ratioY) { // viewport is x-bound
            mat3.scale(view, view, vec2.fromValues(1/SCREEN_WIDTH, 1/(this.height / this.width * SCREEN_WIDTH)));
            mat3.translate(view, view, vec2.fromValues(0, ((this.height / this.width * SCREEN_WIDTH) - SCREEN_HEIGHT) / 2));
        } else {
            mat3.scale(view, view, vec2.fromValues(1/(this.width / this.height * SCREEN_HEIGHT), 1/SCREEN_HEIGHT));
            mat3.translate(view, view, vec2.fromValues(((this.width / this.height * SCREEN_HEIGHT) - SCREEN_WIDTH) / 2, 0));
        }
        mat3.mul(view, view, transform);

        const projectionMatrix = mat4.create();
        const zNear = 0.1;
        const zFar = 100.0;
        mat4.ortho(projectionMatrix, -0.5, 0.5, -0.5, 0.5, zNear, zFar);

        const viewMatrix = mat4.create();
        mat4.lookAt(viewMatrix, vec3.fromValues(0.5, 0.5, -1.0), vec3.fromValues(0.5, 0.5, 0), vec3.fromValues(0, -1, 0));
        mat4.mul(viewMatrix, viewMatrix, mat4.fromValues(view[0], view[1], 0.0, view[2], view[3], view[4], 0.0, view[5], 0, 0, 1, 0, view[6], view[7], 0.0, view[8]));
        mat4.mul(this.pvMatrix, projectionMatrix, viewMatrix);
        mat4.copy(camera.pvMatrix, this.pvMatrix);

        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, camera.buffer);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.clearDepth(1.0);

        for (const bucket of this.sprites) {
            for (const sprite of bucket) {
                sprite.draw();
            }
        }
    }

    private resizeCanvasToDisplaySize() {
        const gl = this.gl;
        const boundingRect = this.el.getBoundingClientRect();
        this.pixelRatio = window.devicePixelRatio;
        this.width = boundingRect.width * this.pixelRatio;
        this.height = boundingRect.height * this.pixelRatio;
        if (gl.canvas.width != this.width || gl.canvas.height != this.height) {
            this.el.style.transformOrigin = '0 0'
            gl.canvas.width = this.width;
            gl.canvas.height = this.height;
            gl.viewport(0, 0, this.width, this.height);
            const ratioX = this.width / SCREEN_WIDTH;
            const ratioY = this.height / SCREEN_HEIGHT;

            mat3.identity(this.displayMatrix);
            if (ratioX < ratioY) {
                mat3.translate(this.displayMatrix, this.displayMatrix, vec2.fromValues(0, (this.height - SCREEN_HEIGHT * ratioX) / 2));
                mat3.scale(this.displayMatrix, this.displayMatrix, vec2.fromValues(ratioX, ratioX));
            } else {
                mat3.translate(this.displayMatrix, this.displayMatrix, vec2.fromValues((this.width - SCREEN_WIDTH * ratioY) / 2, 0));
                mat3.scale(this.displayMatrix, this.displayMatrix, vec2.fromValues(ratioY, ratioY));
            }
        }
    }
}