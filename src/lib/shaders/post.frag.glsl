precision lowp float;

uniform sampler2D uSampler;
uniform sampler2D uSecondaryCamera;
uniform sampler2D uThirdCamera;
uniform sampler2D uPerlinNoise;

uniform vec2 uCharacterPos;
uniform vec2 uPortal1Origin;
uniform vec2 uPortal1Normal;
uniform vec2 uPortal2Origin;
uniform vec2 uPortal2Normal;
uniform highp vec2 uScreenSize;
uniform float uTime;

varying vec2 vUv;
varying vec2 vWorldCoord;

const float expansion = 0.9;

const vec3 portal1Color = vec3(0.0039, 0.9647, 0.9490);
const vec3 portal2Color = vec3(0.96, 0.93, 0.015);

#define clamp(x) max(0.0, min(1.0, x))

vec2 rotate90(in vec2 vec) {
    return vec2(vec.y, -vec.x);
}
vec2 rotate270(in vec2 vec) {
    return vec2(-vec.y, vec.x);
}

/**
 * Returns the z-value of the sample with respect to the provided portal.
 * z-value of 1 means fully inside the portal
 * z-value of 0 means fully outside the portal
 */
float getPortalZ(in vec2 characterPos, in vec2 portalOrigin, in vec2 portalNormal) {
    vec2 characterPortal = portalOrigin - characterPos;
    vec2 portalFragment = portalOrigin - vWorldCoord;
    vec2 portalTangent = rotate90(portalNormal);

    // Prevent viewing the portal from behind
    if (dot(characterPortal, portalNormal) > 0.0) {
        return 0.0;
    }

    vec2 advance = normalize(characterPortal) * min(length(characterPortal), 1.0);
    vec2 characterFragment = vWorldCoord - (characterPos + advance);

    vec2 portalTopEdge = portalOrigin + portalTangent * expansion;
    vec2 portalBottomEdge = portalOrigin - portalTangent * expansion;
    vec2 characterTopEdge = normalize(portalTopEdge - (characterPos + advance));
    vec2 characterBottomEdge = normalize(portalBottomEdge - (characterPos + advance));

    float distanceToSide = clamp(1.0 * min(dot(characterFragment, rotate90(characterTopEdge)), dot(characterFragment, rotate270(characterBottomEdge)))
        + clamp(0.75 - dot(-characterPortal, portalNormal) / 4.0));

    float nearWall = clamp(clamp(dot(portalNormal, portalFragment) * 100.0) + clamp(length(portalFragment) - length(characterPortal)));
    float farWall = clamp(5.0 - 1.0 * length(characterPortal) - length(portalFragment) / 4.0);
    return farWall * nearWall * distanceToSide;
}

vec4 getPortalSample(in float deltaHeight, in vec2 characterPortal, in vec2 portalNormal, in sampler2D camera, in vec3 portalColor, in vec3 otherPortalColor) {
    float gain = 4.0 * (length(characterPortal) + 1.0);
    vec3 theTint = mix(otherPortalColor, portalColor, clamp(length(characterPortal) / 3.0 + 0.5));
    // TODO: What does this mean? Can simplify?
    vec3 color = mix(theTint, vec3(texture2D(camera, vUv)), clamp(10.0 * deltaHeight * gain - 9.0));
    vec3 colorOpposite = mix(theTint, vec3(texture2D(camera, vUv)), clamp(deltaHeight * gain));
    vec3 colorComposite = mix(colorOpposite, color, clamp(length(characterPortal)));
    return mix(texture2D(uSampler, vUv), vec4(colorComposite, 1.0), clamp(deltaHeight * gain));
}

float easing(float value) {
    // 6*Math.pow(t,5) - 15*Math.pow(t,4) + 10*Math.pow(t,3)
    float p3 = value*value*value;
    float p4 = p3 * value;
    float p5 = p4 * value;
    return 6.0 * p5 - 15.0 * p4 + 10.0 * p3;
}

float getGroundHeight(vec2 characterPos) {
    vec3 noiseCoords = vec3((vWorldCoord - characterPos) * 1.6, uTime / 1000.0);
    vec3 minXYZ = floor(noiseCoords);
    vec3 topLeft =      vec3(texture2D(uPerlinNoise, mod(vec2(minXYZ) + vec2(mod(minXYZ.z, 4.0), mod(minXYZ.z / 4.0, 4.0)), 16.0)/ 16.0)) * 2.0 - 1.0;
    vec3 topRight =     vec3(texture2D(uPerlinNoise, mod(vec2(minXYZ) + vec2(mod(minXYZ.z, 4.0), mod(minXYZ.z / 4.0, 4.0)) + vec2(1.0, 0.0), 16.0)/ 16.0)) * 2.0 - 1.0;
    vec3 bottomLeft =   vec3(texture2D(uPerlinNoise, mod(vec2(minXYZ) + vec2(mod(minXYZ.z, 4.0), mod(minXYZ.z / 4.0, 4.0)) + vec2(0.0, 1.0), 16.0)/ 16.0)) * 2.0 - 1.0;
    vec3 bottomRight =  vec3(texture2D(uPerlinNoise, mod(vec2(minXYZ) + vec2(mod(minXYZ.z, 4.0), mod(minXYZ.z / 4.0, 4.0)) + vec2(1.0, 1.0), 16.0)/ 16.0)) * 2.0 - 1.0;
    vec3 topLeftB =     vec3(texture2D(uPerlinNoise, mod(vec2(minXYZ) + vec2(mod(minXYZ.z + 1.0, 4.0), mod((minXYZ.z + 1.0) / 4.0, 4.0)), 16.0)/ 16.0)) * 2.0 - 1.0;
    vec3 topRightB =    vec3(texture2D(uPerlinNoise, mod(vec2(minXYZ) + vec2(mod(minXYZ.z + 1.0, 4.0), mod((minXYZ.z + 1.0) / 4.0, 4.0)) + vec2(1.0, 0.0), 16.0)/ 16.0)) * 2.0 - 1.0;
    vec3 bottomLeftB =  vec3(texture2D(uPerlinNoise, mod(vec2(minXYZ) + vec2(mod(minXYZ.z + 1.0, 4.0), mod((minXYZ.z + 1.0) / 4.0, 4.0)) + vec2(0.0, 1.0), 16.0)/ 16.0)) * 2.0 - 1.0;
    vec3 bottomRightB = vec3(texture2D(uPerlinNoise, mod(vec2(minXYZ) + vec2(mod(minXYZ.z + 1.0, 4.0), mod((minXYZ.z + 1.0) / 4.0, 4.0)) + vec2(1.0, 1.0), 16.0)/ 16.0)) * 2.0 - 1.0;

    float s = dot(topLeft, noiseCoords - minXYZ);
    float t = dot(topRight, noiseCoords - minXYZ - vec3(1.0, 0.0, 0.0));
    float u = dot(bottomLeft, noiseCoords - minXYZ - vec3(0.0, 1.0, 0.0));
    float v = dot(bottomRight, noiseCoords - minXYZ - vec3(1.0, 1.0, 0.0));
    float w = dot(topLeftB, noiseCoords - minXYZ - vec3(0.0, 0.0, 1.0));
    float x = dot(topRightB, noiseCoords - minXYZ - vec3(1.0, 0.0, 1.0));
    float y = dot(bottomLeftB, noiseCoords - minXYZ - vec3(0.0, 1.0, 1.0));
    float z = dot(bottomRightB, noiseCoords - minXYZ - vec3(1.0, 1.0, 1.0));

    float sx = easing(noiseCoords.x - minXYZ.x);
    float sy = easing(noiseCoords.y - minXYZ.y);
    float sz = easing(noiseCoords.z - minXYZ.z);

    float a = s + sx * (t - s);
    float b = u + sx * (v - u);
    float c = w + sx * (x - w);
    float d = y + sx * (z - y);

    float front = a + sy * (b - a);
    float back = c + sy * (d - c);

    float noise = front + sz * (back - front);

    return noise * 0.4 + 0.5; // (sin(vWorldCoord.x * 15.0 + uTime / 200.0) / 2.0 + cos(vWorldCoord.y * 15.0) / 2.0) / 4.0 + 0.5;
}

void main() {
    // gl_FragColor = vec4((vWorldCoord - uCharacterPos) / 32.0, 0.0, 1.0);
    float height1 = getPortalZ(uCharacterPos, uPortal1Origin, uPortal1Normal);
    float height2 = getPortalZ(uCharacterPos, uPortal2Origin, uPortal2Normal);

    // Shortcuts, avoid useless texture lookups and noise computations
    if (height1 == 0.0 && height2 == 0.0) {
        gl_FragColor = texture2D(uSampler, vUv);
    } else if (height1 == 1.0) {
        gl_FragColor = texture2D(uSecondaryCamera, vUv);
    } else if (height2 == 1.0) {
        gl_FragColor = texture2D(uThirdCamera, vUv);
    } else if (height1 > height2) {
        gl_FragColor = getPortalSample(height1 - getGroundHeight(uCharacterPos), uPortal1Origin - uCharacterPos, uPortal1Normal, uSecondaryCamera, portal1Color, portal2Color);
    } else {
        gl_FragColor = getPortalSample(height2 - 1.0 + getGroundHeight(uCharacterPos), uPortal2Origin - uCharacterPos, uPortal2Normal, uThirdCamera, portal2Color, portal1Color);
    }
}
