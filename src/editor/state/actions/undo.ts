import produce from "immer";
import { action } from "../action-factory";
import { AppState } from "../state";

export const pushSceneToUndoStack = action('pushSceneToUndoStack', (s: AppState) => produce(s, draft => {
    draft.undoStack = {
        scene: draft.scene,
        next: draft.undoStack
    };
    draft.redoStack = null;
}));

export const popSceneFromUndoStack = action('popSceneFromUndoStack', (s: AppState) => produce(s, draft => {
    if (draft.undoStack == null) {
        return;
    }
    draft.redoStack = {
        scene: draft.scene,
        next: draft.redoStack
    };
    draft.scene = draft.undoStack.scene;
    draft.undoStack = draft.undoStack.next;
}));

export const popSceneFromRedoStack = action('popSceneFromRedoStack', (s: AppState) => produce(s, draft => {
    if (draft.redoStack == null) {
        return;
    }
    draft.undoStack = {
        scene: draft.scene,
        next: draft.undoStack
    };
    draft.scene = draft.redoStack.scene;
    draft.redoStack = draft.redoStack.next;
}));
