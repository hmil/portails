import * as rt from 'runtypes';
import { PortailsSceneV2 } from './v2';

export type PortailsScene = rt.Static<typeof PortailsScene>;
export const PortailsScene = rt.Union(PortailsSceneV2);