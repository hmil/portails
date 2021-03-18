
export interface Vertex {
    x: number;
    y: number;
}

export interface Transform extends Vertex {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
}

export function transformDefaults(): Transform {
    return { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 };
}

export interface ChainGeometry {
    type: 'chain';
    vertices: ReadonlyArray<Vertex>;
}


export interface Rectangle {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

export type ObjectGeometry = ChainGeometry;
