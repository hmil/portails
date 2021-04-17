import produce from "immer";
import { action } from "../action-factory";
import { AppState, GrabbedSprite } from "../state";

export const grabSprite = action('grabSprite', (s: AppState, data: GrabbedSprite) => produce(s, draft => {
    draft.grabbedThing = {
        ...data
    };
}));

export const stopGrabbing = action('stopGrabbing', (s: AppState) => produce(s, draft => {
    draft.grabbedThing = null;
}));