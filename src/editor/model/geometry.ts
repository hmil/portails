import { uniqId } from "editor/utils/uid";
import { WritableDraft } from "immer/dist/internal";

export interface Vertex {
    x: number;
    y: number;
}

export interface Transform extends Vertex {
    scaleX: number;
    scaleY: number;
    rotation: number;
}

export function transformDefaults(): Transform {
    return { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 };
}

export interface ChainGeometry {
    type: 'chain';
    geometryId: string;
    name: string;
    ownerId: string;
    vertices: ReadonlyArray<Vertex>;
}


export interface Rectangle {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

export type ObjectGeometry = ChainGeometry;

export function geometryDefaults(ownerId: string, geometryId: string): WritableDraft<ObjectGeometry> {
    return {
        type: 'chain',
        geometryId,
        name: 'New geometry',
        ownerId,
        vertices: [
            { x: 0, y: 0},
            { x: 1, y: 0}
        ]
    };
}