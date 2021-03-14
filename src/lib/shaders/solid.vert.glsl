precision lowp float;

attribute vec4 aVertexPosition;

uniform mat4 uModel;
uniform mat4 uPV;

void main() {
    gl_Position = uPV * uModel * aVertexPosition;
}
