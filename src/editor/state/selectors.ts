import { ObjectGeometry } from "editor/model/geometry";
import { WorldObject } from "editor/model/object";
import { ObjectSprite } from "editor/model/sprite";
import { AppState } from "./state";

export function getCurrentGeometry(state: AppState): ObjectGeometry | undefined {
    const selection = state.scene.selection;
    if (selection?.type !== 'geometry') {
        return;
    }
    const selectedObject = getSelectedObject(state);
    if (selectedObject != null) {
        return selectedObject.geometries.find(s => s.geometryId === selection.geometryId);
    }
}

export function getSelectedSprite(state: AppState): ObjectSprite | undefined {
    const selection = state.scene.selection;
    if (selection?.type !== 'sprite') {
        return;
    }
    const selectedObject = getSelectedObject(state);
    if (selectedObject != null) {
        return selectedObject.sprites.find(s => s.spriteId === selection.spriteId);
    }
}

export function getSelectedObject(state: AppState): WorldObject | undefined {
    return state.scene.objects.find(obj => obj.guid === state.scene.selection?.objectId);
}