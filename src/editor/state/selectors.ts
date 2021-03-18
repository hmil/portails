import { WorldObject } from "editor/model/object";
import { ObjectSprite } from "editor/model/sprite";
import { AppState } from "./state";

export function getSelectedSprite(state: AppState): ObjectSprite | undefined {
    const selectedObject = getSelectedObject(state);
    if (selectedObject != null) {
        return selectedObject.sprites.find(s => s.selected);
    }
}

export function getSelectedObject(state: AppState): WorldObject | undefined {
    return state.objects.find(obj => obj.guid === state.selectedObjectId);
}