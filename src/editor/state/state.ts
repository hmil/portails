import { WorldObject, worldObjectDefaults } from "editor/model/object";
import { Viewport } from "editor/model/viewport";


export interface AppState {
    objects: ReadonlyArray<WorldObject>;
    selectedObjectId: string | null;
    viewport: Viewport;
}

export const appInitialState: AppState = {
    objects: [worldObjectDefaults('default')],
    selectedObjectId: null,
    viewport: {
        centerX: 0,
        centerY: 0,
        zoomFactor: 50
    }
};
