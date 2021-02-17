attribute vec4 aVertexPosition;
attribute vec2 aScreenPosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec2 uScreenSize;

varying vec2 vUv;
varying vec2 vScreenCoord;

void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vec2 uvPosition = vec2((aVertexPosition.x + 1.0) / 2.0, 1.0 - (aVertexPosition.y + 1.0) / 2.0);
    vUv = uvPosition;
    vScreenCoord = vec2(uvPosition.x * uScreenSize.x, uvPosition.y * uScreenSize.y);
}
