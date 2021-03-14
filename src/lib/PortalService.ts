import { vec2 } from "gl-matrix";

export class PortalService {

    public static playerPos = vec2.create();

    public static portal1Position = vec2.create();
    public static portal1Normal = vec2.create();
    public static portal2Position = vec2.create();
    public static portal2Normal = vec2.create();
    public static get isMirror() {
        return vec2.dot(PortalService.portal1Normal, PortalService.portal2Normal) > 0.1;
    }
}