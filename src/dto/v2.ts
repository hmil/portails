import * as rt from 'runtypes';

export type PortailsTransform = rt.Static<typeof PortailsTransform>;
export const PortailsTransform = rt.Record({
    x: rt.Number,
    y: rt.Number,
    sX: rt.Number,
    sY: rt.Number,
    a: rt.Number
});

export type PortailsSprite = rt.Static<typeof PortailsSprite>;
export const PortailsSprite = rt.Intersect(
    rt.Record({
        name: rt.String,
        src: rt.String,
        transform: PortailsTransform,
    }),
    rt.Partial({
        background: rt.Boolean
    })
);

export type PortailsVertex = rt.Static<typeof PortailsVertex>;
export const PortailsVertex = rt.Record({
    x: rt.Number,
    y: rt.Number
});

export type PortailsGeometry = rt.Static<typeof PortailsGeometry>;
export const PortailsGeometry = rt.Record({
    name: rt.String,
    vertices: rt.Array(PortailsVertex)
});

export type PortailsObject = rt.Static<typeof PortailsObject>;
export const PortailsObject = rt.Record({
    sprites: rt.Array(PortailsSprite),
    geometries: rt.Array(PortailsGeometry),
    name: rt.String,
    transform: PortailsTransform
});

export type PortailsSceneV2 = rt.Static<typeof PortailsSceneV2>;
export const PortailsSceneV2 = rt.Record({
    version: rt.Literal(2),
    objects: rt.Array(PortailsObject)
});
