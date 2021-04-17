import { DisplayCanvasRect } from "editor/services/DisplayService";
import produce from "immer";
import { action } from "../action-factory";
import { AppState } from "../state";

export const scrollViewport = action('scrollViewport', (s: AppState, data: { deltaX: number, deltaY: number}) => produce(s, draft => {
    draft.viewport.centerX += data.deltaX / draft.viewport.zoomFactor;
    draft.viewport.centerY += data.deltaY / draft.viewport.zoomFactor;
}));

export const zoomViewport = action('zoomViewport', (s: AppState, data: { delta: number }) => produce(s, draft => {
    draft.viewport.zoomFactor += draft.viewport.zoomFactor * data.delta * 0.02;
}));

export const setCanvasRect = action('setCanvasRect', (s: AppState, data: { canvasRect: DisplayCanvasRect }) => produce(s, draft => {
    draft.canvasRect = data.canvasRect;
}));
