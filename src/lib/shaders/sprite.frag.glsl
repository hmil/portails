precision lowp float;

uniform sampler2D uSampler;

varying vec2 vUv;

void main() {
    gl_FragColor = texture2D(uSampler, vUv);
}
