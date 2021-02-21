precision lowp float;

attribute vec4 aVertexPosition;
attribute vec2 aScreenPosition;

uniform highp vec2 uScreenSize;
uniform mat3 uViewMatrix;

varying vec2 vUv;
varying vec2 vWorldCoord;


vec2 displayToWorldCoordinates(in vec2 displayCoords) {
    return vec2(uViewMatrix * vec3(displayCoords, 1.0));
}

void main() {
    gl_Position = aVertexPosition;
    vec2 uvPosition = vec2((aVertexPosition.x + 1.0) / 2.0, 1.0 - (aVertexPosition.y + 1.0) / 2.0);
    vUv = uvPosition;
    vWorldCoord = displayToWorldCoordinates(vec2(uvPosition.x * uScreenSize.x, uvPosition.y * uScreenSize.y));
}
