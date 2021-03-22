import { action, ActionTypes } from './action-factory';
import * as objectActions from './actions/object';
import * as spriteActions from './actions/sprite';
import * as viewportActions from './actions/viewport';
import * as undoActions from './actions/undo';
import { appInitialState, AppState } from './state';
import { Scene } from 'editor/model/scene';
import produce from 'immer';

export * from './actions/object';
export type ObjectActions = ActionTypes<typeof objectActions>;

export * from './actions/sprite';
export type SpriteActions = ActionTypes<typeof spriteActions>;

export * from './actions/viewport';
export type ViewportActions = ActionTypes<typeof viewportActions>;

export * from './actions/undo';
export type UndoActions = ActionTypes<typeof undoActions>;

export const loadScene = action('loadScene', (s: AppState, data: { scene: Scene }) => ({
    ...s,
    viewport: appInitialState.viewport,
    undoStack: null,
    redoStack: null,
    scene: {
        ...data.scene,
        selectedObjectId: null
    }
}));

export const toggleGridSnapping = action('toggleGridSnapping', (s: AppState) => produce(s, draft => {
    draft.gridConfig.enabled = !draft.gridConfig.enabled;
}));
