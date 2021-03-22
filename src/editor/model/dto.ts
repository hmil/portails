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
export const PortailsSprite = rt.Record({
    name: rt.String,
    src: rt.String,
    transform: PortailsTransform
});

export type PortailsObject = rt.Static<typeof PortailsObject>;
export const PortailsObject = rt.Record({
    sprites: rt.Array(PortailsSprite),
    name: rt.String,
    transform: PortailsTransform
});

export type PortailsScene = rt.Static<typeof PortailsScene>;
export const PortailsScene = rt.Record({
    version: rt.Literal(1),
    objects: rt.Array(PortailsObject)
});
