import { worldObjectDefaults } from 'editor/model/object';
import { Scene } from 'editor/model/scene';
import { Viewport } from 'editor/model/viewport';
import { defaultGridConfig, GridConfig } from 'editor/services/GridService';

/**
 * This is the state in the undo/redo stack
 */
export interface SceneState extends Scene {
    selectedObjectId: string | null;
}

export type UndoStackObj = { scene: SceneState, next: UndoStackObj } | null;

export interface AppState {
    scene: SceneState;
    undoStack: UndoStackObj;
    redoStack: UndoStackObj;
    viewport: Viewport;
    gridConfig: GridConfig;
}

export const appInitialState: AppState = {
    undoStack: null,
    redoStack: null,
    scene: {
        objects: [worldObjectDefaults('default')],
        selectedObjectId: null,
    },
    viewport: {
        centerX: 0,
        centerY: 0,
        zoomFactor: 50
    },
    gridConfig: defaultGridConfig
};
