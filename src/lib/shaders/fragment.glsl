precision highp float;


uniform sampler2D uSampler;
uniform sampler2D uSecondaryCamera;
uniform sampler2D uThirdCamera;

uniform vec2 uPortal1Origin;
uniform vec2 uPortal1Normal;
uniform vec2 uPortal2Origin;
uniform vec2 uPortal2Normal;
uniform vec2 uScreenSize;

varying vec2 vUv;
varying vec2 vScreenCoord;

const float expansion = 150.0;

const vec3 portal1Color = vec3(0.0039, 0.9647, 0.9490);
const vec3 portal2Color = vec3(0.96, 0.93, 0.015);

#define clamp(x) max(0.0, min(1.0, x))

vec2 rotate90(in vec2 vec) {
    return vec2(vec.y, -vec.x);
}

/** Returns 1.0 if v1 is in first quadrant relative to v2 */
float firstHalf(in vec2 v1, in vec2 v2) {
    float ddp = dot(rotate90(normalize(v1)), normalize(v2));

    return ddp;
}

vec4 getPortalSample(in vec2 characterPos, in vec2 portalOrigin, in vec2 portalNormal, in vec3 portalTint, in vec3 otherPortalTint, in sampler2D sampler) {
    vec2 characterPortal = portalOrigin - characterPos;
    vec2 characterFragment = vScreenCoord - characterPos;

    if (dot(characterPortal, portalNormal) > 0.0 || dot(portalNormal, portalOrigin - vScreenCoord) < 0.0) {
        return vec4(0.0, 0.0, 0.0, 0.0);
    }

    vec2 portalTopEdge = portalOrigin + rotate90(portalNormal) * expansion;
    vec2 portalBottomEdge = portalOrigin - rotate90(portalNormal) * expansion;
    vec2 characterTopEdge = portalTopEdge - characterPos;
    vec2 characterBottomEdge = portalBottomEdge - characterPos;

    float fq = firstHalf(characterFragment, characterTopEdge);
    float lq = firstHalf(characterBottomEdge, characterFragment);

    float blendFactor = min(1.0, max(0.0, min(0.0, 4.0 * fq) * min(0.0, 4.0 * lq)));

    float tint = min(1.0, 100.0/length(characterPortal));

    float pastWall = dot(portalNormal, portalOrigin - vScreenCoord) > 0.0 ? 1.0 : 0.0;

    float farClip = max(0.0, min(1.0, 1000.0 / length(characterPortal) - length(characterFragment) / 1024.0));

    vec3 theTint = mix(portalTint, otherPortalTint, clamp(clamp(30.0 / length(characterPortal)) - 0.5));

    return vec4(mix(theTint, vec3(texture2D(sampler, vUv)), pastWall * farClip * blendFactor), pastWall * farClip * blendFactor);
}

void main() {
    vec2 characterPos = uScreenSize / 2.0;

    // vec2 portalOriginFixed = uPortal1Origin + uPortal1Normal * 5.0;
    

    // float fragmentCenterDistance = dot(normalize(characterFragment), normalize(characterPortal));
    // float topEdgeCenterDistance = dot(normalize(characterTopEdge), normalize(characterPortal));
    // float bottomEdgeCenterDistance = dot(normalize(characterBottomEdge), normalize(characterPortal));

    // float fader = min(max(fragmentCenterDistance - topEdgeCenterDistance, 0.0), 1.0) * pastWall;
    vec4 baseColor = texture2D(uSampler, vUv);
    vec4 color1 = getPortalSample(characterPos, uPortal1Origin, uPortal1Normal, portal1Color, portal2Color, uSecondaryCamera);
    vec4 color2 = getPortalSample(characterPos, uPortal2Origin, uPortal2Normal, portal2Color, portal1Color, uThirdCamera);
    
    gl_FragColor = vec4(mix(mix(vec3(baseColor), vec3(color1), color1.a), vec3(color2), color2.a), 1.0); // vec4(mix(mix(vec3(), vec3(texture2D(uSecondaryCamera, vUv)), fader1), vec3(texture2D(uThirdCamera, vUv)), fader2), 1.0);

    // vec3 debugColor = vec3(max(0.0, fq + lq - 1.0), 0.0, 0.0);
    // gl_FragColor = vec4(mix(vec3(texture2D(uSampler, vUv)), debugColor, pastWall), 1.0);
}
