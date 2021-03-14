import { mat3, mat4, vec2, vec3 } from "gl-matrix";


export function loadProgram(gl: WebGLRenderingContext, vert: string, frag: string): WebGLShader {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vert);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, frag);
    const shaderProgram = gl.createProgram();
    if (shaderProgram == null) {
        throw new Error('Cant initialize shader');
    }
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        throw new Error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    }

    return shaderProgram;
}

export function loadShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
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

const tmpV2 = vec2.create();
/**
 * Computes the model matrix for a given rigid body.
 */
export function rigidBodyTransform(dest: mat3, body: planck.Body): mat3 {
    const pos = body.getPosition();
    mat3.identity(dest);
    mat3.translate(dest, dest, vec2.set(tmpV2, pos.x, pos.y));
    mat3.rotate(dest, dest, body.getAngle());
    return dest;
}

export function copyTransformToMat4(out: mat4, t: mat3): mat4 {
    mat4.set(out,
        t[0], t[1], 0.0, t[2],
        t[3], t[4], 0.0, t[5],
        0.0 , 0.0 , 1.0, 0   ,
        t[6], t[7], 0.0, t[8]);
    return out;
}

export function getUniformLocationOrFail(gl: WebGLRenderingContext, program: WebGLProgram, name: string): WebGLUniformLocation {
    const uniform = gl.getUniformLocation(program, name);
    if (uniform == null) {
        throw new Error(`Failed to get uniform location for "${name}"`);
    }
    return uniform;
}
