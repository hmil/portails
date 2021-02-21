precision lowp float;

uniform sampler2D uSampler;
uniform sampler2D uSecondaryCamera;
uniform sampler2D uThirdCamera;

uniform mat3 uViewMatrix;
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

vec2 displayToWorldCoordinates(in vec2 displayCoords) {
    return vec2(uViewMatrix * vec3(displayCoords, 1.0));
}

/**
 * Returns the z-value of the sample with respect to the provided portal.
 * z-value of 1 means fully inside the portal
 * z-value of 0 means fully outside the portal
 */
float getPortalZ(in vec2 characterPos, in vec2 portalOrigin, in vec2 portalNormal) {
    vec2 characterPortal = portalOrigin - characterPos;
    vec2 characterFragment = vWorldCoord - characterPos;
    vec2 portalFragment = portalOrigin - vWorldCoord;
    vec2 portalTangent = rotate90(portalNormal);

    // Prevent viewing the portal from behind
    if (dot(characterPortal, portalNormal) > 0.0) {
        return 0.0;
    }

    vec2 portalTopEdge = portalOrigin + portalTangent * expansion;
    vec2 portalBottomEdge = portalOrigin - portalTangent * expansion;
    vec2 characterTopEdge = normalize(portalTopEdge - characterPos);
    vec2 characterBottomEdge = normalize(portalBottomEdge - characterPos);

    float sideLimitTop = dot(rotate90(normalize(characterFragment)), characterTopEdge);
    float sideLimitBottom = dot(rotate90(characterBottomEdge), normalize(characterFragment));
    float sideLimit = dot(normalize(characterFragment), characterTopEdge) > dot(characterBottomEdge, normalize(characterFragment)) ? sideLimitTop : sideLimitBottom;

    float sharpness = length(characterPortal) * 10.0 + 1.5;

    // Block when:
    // - direction of portalNormal, and...
    // - (fragment closer than expansion, or character further than expansion)
    float nearWall = (dot(portalNormal, portalFragment) < 0.0 && (
            length(portalFragment) < expansion ||
            length(characterPortal) > expansion
        )) ? 0.0 : 1.0;
    
    float farWall = clamp((8.0 / length(characterPortal)/* * -dot(normalize(characterPortal), portalNormal)*/ - length(characterFragment) / 2.0) / 2.0);
    
    return (1.0 - clamp(sideLimit * sharpness + 0.5)) * farWall * nearWall;
}

vec4 getPortalSample(in float deltaHeight, in vec2 characterPortal, in vec2 portalNormal, in sampler2D camera, in vec3 portalColor, in vec3 otherPortalColor) {
    const float gain = 4.0;
    float gainOpposite = length(-exp(-dot(characterPortal, portalNormal) * 4.0)) + 4.0;

    float correctHeight = clamp(deltaHeight * 100.0);

    vec3 theTint = mix(otherPortalColor, portalColor, clamp(length(characterPortal) / 3.0 + 0.5));
    vec3 color = mix(theTint, vec3(texture2D(camera, vUv)), clamp(deltaHeight * gain));

    vec3 oppositeFade = mix(theTint, color, correctHeight);

    return vec4(mix(vec3(texture2D(uSampler, vUv)), oppositeFade, clamp((deltaHeight + 1.0 / gainOpposite) * gainOpposite)), 1.0);
}

float getGroundHeight() {
    return (sin(vWorldCoord.x * 15.0 + uTime / 200.0) / 2.0 + cos(vWorldCoord.y * 15.0) / 2.0) / 4.0 + 0.5;
}

void main() {
    vec2 characterPos = displayToWorldCoordinates(uScreenSize / 2.0);
    // vec4 color1 = getPortalSample(characterPos, uPortal1Origin, uPortal1Normal, portal1Color, portal2Color, uSecondaryCamera);
    // vec4 color2 = getPortalSample(characterPos, uPortal2Origin, uPortal2Normal, portal2Color, portal1Color, uThirdCamera);
    float height1 = getPortalZ(characterPos, uPortal1Origin, uPortal1Normal);
    float height2 = getPortalZ(characterPos, uPortal2Origin, uPortal2Normal);

    // Shortcuts, avoid useless texture lookups
    if (height1 == 0.0 && height2 == 0.0) {
        gl_FragColor = texture2D(uSampler, vUv);
    } else if (height1 == 1.0) {
        gl_FragColor = texture2D(uSecondaryCamera, vUv);
    } else if (height2 == 1.0) {
        gl_FragColor = texture2D(uThirdCamera, vUv);
    } else if (height1 > height2) {
        gl_FragColor = getPortalSample(height1 - getGroundHeight(), uPortal1Origin - characterPos, uPortal1Normal, uSecondaryCamera, portal1Color, portal2Color);
    } else {
        gl_FragColor = getPortalSample(height2 - 1.0 + getGroundHeight(), uPortal2Origin - characterPos, uPortal2Normal, uThirdCamera, portal2Color, portal1Color);
    }
}
