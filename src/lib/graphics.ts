import { Assets } from "./assets";
import { Sprite } from "./sprite";
import * as Rematrix from 'rematrix';
import { mat4 } from './gl-matrix';
import { PortalService } from "./PortalService";

export const SCREEN_WIDTH = 16;
export const SCREEN_HEIGHT = 9;


export class Camera {

    public transform: Rematrix.Matrix3D = Rematrix.identity();
    private angle: number = 0;

    constructor(public readonly ctx: CanvasRenderingContext2D) { }

    public resetTransform() {
        this.transform = Rematrix.identity();
        this.angle = 0;
    }

    public translate(dx: number, dy: number) {
        this.transform = Rematrix.multiply(this.transform, Rematrix.translate(-dx, -dy));
    }

    public getAngle() {
        return this.angle;
    }

    public rotate(alpha: number) {
        this.angle = alpha;
        this.transform = Rematrix.multiply(this.transform, Rematrix.rotate(-alpha / 2 / Math.PI * 360));
    }

    public project() {
        this.ctx.transform(this.transform[0], this.transform[1], this.transform[4], this.transform[5], this.transform[12], this.transform[13]);
    }
}

export class OffscreenCamera extends Camera {
    constructor(public readonly canvas: OffscreenCanvas) {
        super(canvas.getContext('2d') as any);
    }
}

export class Graphics {

    public readonly gl: WebGLRenderingContext;
    private readonly el: HTMLCanvasElement;

    private scalingFactor = 1;
    private offsetX = 0;
    private offsetY = 0;
    private width = 0;
    private height = 0;
    private pixelRatio = 1;

    private sprites: Sprite[][] = [];

    private mainCamera?: Camera;
    public secondaryCamera: Camera;
    public thirdCamera: Camera;

    private buffers: { [k: string]: WebGLBuffer };
    private programInfo: {
        program: WebGLProgram;
        attribLocations: {
            vertexPosition: number;
            screenPosition: number;
        };
        uniformLocations: {
            projectionMatrix: WebGLUniformLocation;
            modelViewMatrix: WebGLUniformLocation;
            uSampler: WebGLUniformLocation;
            uSecondCamera: WebGLUniformLocation;
            uThirdCamera: WebGLUniformLocation;
            portal1Origin: WebGLUniformLocation;
            portal1Normal: WebGLUniformLocation;
            portal2Origin: WebGLUniformLocation;
            portal2Normal: WebGLUniformLocation;
            uScreenSize: WebGLUniformLocation;
        };
    };
    private texture: WebGLTexture;
    private texture2: WebGLTexture;
    private texture3: WebGLTexture;
    // private frameBuffer: ImageData;

    constructor(private readonly assets: Assets) {
        this.el = document.createElement('canvas');
        this.el.addEventListener('contextmenu', event => event.preventDefault());
        this.el.style.width = '100%';
        this.el.style.height = '100%';
        const gl = this.el.getContext('webgl');
        if (gl == null) {
            throw new Error('Canvas not supported in this browser');
        }
        this.gl = gl;
        document.body.append(this.el);
        this.resizeCanvasToDisplaySize();
        this.layout();
        window.addEventListener('resize', () => this.layout());

        // Init shader program
        const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, require('./shaders/vertex.glsl').default);
        const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, require('./shaders/fragment.glsl').default);
        const shaderProgram = gl.createProgram();
        if (shaderProgram == null) {
            throw new Error('Cant initialize shader');
        }
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        // If creating the shader program failed, alert

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            throw new Error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        }

        this.programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                screenPosition: gl.getAttribLocation(shaderProgram, 'aScreenPosition'),
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix')!,
                modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix')!,
                uSampler: gl.getUniformLocation(shaderProgram, 'uSampler')!,
                uSecondCamera: gl.getUniformLocation(shaderProgram, 'uSecondaryCamera')!,
                uThirdCamera: gl.getUniformLocation(shaderProgram, 'uThirdCamera')!,
                portal1Origin: gl.getUniformLocation(shaderProgram, 'uPortal1Origin')!,
                portal1Normal: gl.getUniformLocation(shaderProgram, 'uPortal1Normal')!,
                portal2Origin: gl.getUniformLocation(shaderProgram, 'uPortal2Origin')!,
                portal2Normal: gl.getUniformLocation(shaderProgram, 'uPortal2Normal')!,
                uScreenSize: gl.getUniformLocation(shaderProgram, 'uScreenSize')!,
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

        this.texture = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        this.secondaryCamera = this.createCamera();
        this.texture2 = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, this.texture2);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        this.thirdCamera = this.createCamera();
        this.texture3 = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, this.texture3);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }

    private loadShader(gl: WebGLRenderingContext, type: number, source: string) {
        const shader = gl.createShader(type);
        if (shader == null) {
            throw new Error('Failed to create shader');
        }
      
        // Send the source to the shader object
      
        gl.shaderSource(shader, source);
      
        // Compile the shader program
      
        gl.compileShader(shader);
      
        // See if it compiled successfully
      
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const error = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(String(error));
        }
      
        return shader;
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

    public mapToWorldCoordinates(clientX: number, clientY: number) {
        return [
            ((clientX * this.pixelRatio - this.offsetX) / this.scalingFactor) - this.getMainCamera().transform[12] - SCREEN_WIDTH / 2,
            ((clientY * this.pixelRatio - this.offsetY) / this.scalingFactor) - this.getMainCamera().transform[13] - SCREEN_HEIGHT / 2,
        ];
    }

    public getMainCamera(): Camera {
        if (this.mainCamera == null) {
            this.mainCamera = this.createCamera();
        }
        return this.mainCamera;
    }

    public createCamera(): OffscreenCamera {
        console.log(this.width);
        return new OffscreenCamera(new OffscreenCanvas(this.width, this.height));
    }

    private i = 0;
    public draw() {
        this.resizeCanvasToDisplaySize();
        const gl = this.gl;
        // Set clear color to black, fully opaque
        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        gl.clearDepth(1.0);                 // Clear everything
        gl.enable(gl.DEPTH_TEST);           // Enable depth testing
        gl.depthFunc(gl.LEQUAL);

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

        // Set the shader uniforms

        gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix as any);
        gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix as any);

        this.render(this.getMainCamera());


        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(this.programInfo.uniformLocations.uSecondCamera, 0);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.getMainCamera().ctx.canvas);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.texture2);
        gl.uniform1i(this.programInfo.uniformLocations.uSecondCamera, 1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.secondaryCamera.ctx.canvas);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.texture3);
        gl.uniform1i(this.programInfo.uniformLocations.uThirdCamera, 2);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.thirdCamera.ctx.canvas);

        const transform = this.getMainCamera().transform;
    
        const [normal1X, normal1Y] = PortalService.portal1Normal as any as number[];
        const normal1XProj = (normal1X * transform[0] + normal1Y * transform[4]);
        const normal1YProj = (normal1X * transform[1] + normal1Y * transform[5]);
        gl.uniform2f(this.programInfo.uniformLocations.portal1Normal, normal1XProj, normal1YProj);

        const [portal1X, portal1Y] = PortalService.portal1Position as any as number[];
        const portal1XProj = (portal1X * transform[0] + portal1Y * transform[4] + transform[12] + SCREEN_WIDTH / 2) * this.scalingFactor + this.offsetX;
        const portal1YProj = (portal1X * transform[1] + portal1Y * transform[5] + transform[13] + SCREEN_HEIGHT / 2) * this.scalingFactor + this.offsetY;
        gl.uniform2f(this.programInfo.uniformLocations.portal1Origin, portal1XProj, portal1YProj);
    
        const [normal2X, normal2Y] = PortalService.portal2Normal as any as number[];
        const normal2XProj = (normal2X * transform[0] + normal2Y * transform[4]);
        const normal2YProj = (normal2X * transform[1] + normal2Y * transform[5]);
        gl.uniform2f(this.programInfo.uniformLocations.portal2Normal, normal2XProj, normal2YProj);

        const [portal2X, portal2Y] = PortalService.portal2Position as any as number[];
        const portal2XProj = (portal2X * transform[0] + portal2Y * transform[4] + transform[12] + SCREEN_WIDTH / 2) * this.scalingFactor + this.offsetX;
        const portal2YProj = (portal2X * transform[1] + portal2Y * transform[5] + transform[13] + SCREEN_HEIGHT / 2) * this.scalingFactor + this.offsetY;
        gl.uniform2f(this.programInfo.uniformLocations.portal2Origin, portal2XProj, portal2YProj);

        gl.uniform2f(this.programInfo.uniformLocations.uScreenSize, this.width, this.height);

        {
            const offset = 0;
            const vertexCount = 4;
            gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
        }
    }

    public render(camera: Camera): void {

        camera.ctx.resetTransform();
        camera.ctx.fillStyle = '#141a20';
        camera.ctx.fillRect(0, 0, this.width, this.height);
        camera.ctx.translate(this.offsetX, this.offsetY);
        camera.ctx.scale(this.scalingFactor, this.scalingFactor);


        camera.ctx.translate(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
        camera.project();

        camera.ctx.strokeStyle = '#fff';
        camera.ctx.lineWidth = 0.05;
        // camera.ctx.strokeRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        for (const bucket of this.sprites) {
            for (const sprite of bucket) {
                camera.ctx.save();
                sprite.draw(camera.ctx, this.assets);
                camera.ctx.restore();
            }
        }
    }

    private resizeCanvasToDisplaySize() {
        const gl = this.gl;
        const boundingRect = this.el.getBoundingClientRect();
        this.pixelRatio = window.devicePixelRatio;
        this.width = boundingRect.width * this.pixelRatio;
        this.height = boundingRect.height * this.pixelRatio;
        if (gl.canvas.width != this.width ||
            gl.canvas.height != this.height) {
                console.log('resize');
            gl.canvas.width = this.width;
            gl.canvas.height = this.height;
            gl.viewport(0, 0, this.width, this.height);
            const ratioX = this.width / SCREEN_WIDTH;
            const ratioY = this.height / SCREEN_HEIGHT;

            if (ratioX < ratioY) {
                this.scalingFactor = ratioX;
                this.offsetX = 0;
                this.offsetY = (this.height - SCREEN_HEIGHT * ratioX) / 2;
            } else {
                this.scalingFactor = ratioY;
                this.offsetX = (this.width - SCREEN_WIDTH * ratioY) / 2;
                this.offsetY = 0;
            }
        }
    }

    // TODO: Replace with above
    private layout(): void {
        // this.pixelRatio = window.devicePixelRatio;
        // const canvasSize = this.el.getBoundingClientRect();
        // this.width = this.el.width = canvasSize.width * this.pixelRatio;
        // this.height = this.el.height = canvasSize.height * this.pixelRatio;

        // const ratioX = this.width / SCREEN_WIDTH;
        // const ratioY = this.height / SCREEN_HEIGHT;

        // if (ratioX < ratioY) {
        //     this.scalingFactor = ratioX;
        //     this.offsetX = 0;
        //     this.offsetY = (this.height - SCREEN_HEIGHT * ratioX) / 2;
        // } else {
        //     this.scalingFactor = ratioY;
        //     this.offsetX = (this.width - SCREEN_WIDTH * ratioY) / 2;
        //     this.offsetY = 0;
        // }
    }
}