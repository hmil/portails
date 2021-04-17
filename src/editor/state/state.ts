import { Scene } from 'editor/model/scene';
import { Viewport } from 'editor/model/viewport';
import { DisplayCanvasRect } from 'editor/services/DisplayService';
import { defaultGridConfig, GridConfig } from 'editor/services/GridService';

/**
 * This is the state in the undo/redo stack
 */
export interface SceneState extends Scene {
    selection: SceneSelection | null;
}

interface SceneSpriteSelection {
    type: 'sprite';
    objectId: string;
    spriteId: string;
}

interface SceneGeometrySelection {
    type: 'geometry';
    objectId: string;
    geometryId: string;
}

interface SceneObjectSelection {
    type: 'object';
    objectId: string;
}

export type SceneSelection = SceneSpriteSelection | SceneGeometrySelection | SceneObjectSelection | null;

export type UndoStackObj = { scene: SceneState, next: UndoStackObj } | null;

export interface GrabbedSprite {
    type: 'sprite',
    src: string;
    clientX: number;
    clientY: number;
    width: number;
    height: number;
}

export type GrabbedThing = GrabbedSprite;

export interface AppState {
    scene: SceneState;
    undoStack: UndoStackObj;
    redoStack: UndoStackObj;
    viewport: Viewport;
    canvasRect: DisplayCanvasRect,
    gridConfig: GridConfig;
    grabbedThing: GrabbedThing | null;
}

export const appInitialState: AppState = {
    undoStack: null,
    redoStack: null,
    scene: {
        objects: [],
        selection: null,
    },
    viewport: {
        centerX: 0,
        centerY: 0,
        zoomFactor: 50
    },
    canvasRect: {
        height: 100, width: 100, x: 0, y: 0
    },
    gridConfig: defaultGridConfig,
    grabbedThing: null
};
