import { mat3, vec2, vec4 } from "gl-matrix";

export class PortalService {

    public static playerPos = vec2.create();
    public static playerTransform = mat3.create();

    public static portal1Position = vec2.create();
    public static portal1Normal = vec2.create();
    public static portal2Position = vec2.create();
    public static portal2Normal = vec2.create();
    public static get isMirror() {
        return vec2.dot(PortalService.portal1Normal, PortalService.portal2Normal) > 0.1;
    }
}

export const PORTAL_COLOR_1 = vec4.fromValues(1/256, 246/256, 242/256, 1);
export const PORTAL_COLOR_2 = vec4.fromValues(245/256, 249/256, 4/256, 1);
