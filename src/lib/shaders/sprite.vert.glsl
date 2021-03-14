precision lowp float;

attribute vec4 aVertexPosition;

uniform mat4 uModel;
uniform mat4 uPV;

varying vec2 vUv;

void main() {
    vec2 uvPosition = vec2((aVertexPosition.x + 1.0) / 2.0, (aVertexPosition.y + 1.0) / 2.0);
    vUv = uvPosition;
    gl_Position = uPV * uModel * aVertexPosition;
}
