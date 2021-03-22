import { worldObjectDefaults, WorldObjectProperties } from "editor/model/object";
import produce from "immer";
import { WritableDraft } from "immer/dist/internal";
import { action } from "../action-factory";
import { AppState } from "../state";

export const createObject = action('createObject', (s: AppState, data: { guid: string }) => produce(s, draft => {
    unselectCurrentDraft(draft);
    draft.scene.selectedObjectId = data.guid;
    const newObject = worldObjectDefaults(data.guid);
    newObject.properties.name = 'New Object ' + data.guid;
    newObject.selected = true;
    draft.scene.objects.push(newObject);
}));

export const deleteSelectedObject = action('deleteSelectedObject', (s: AppState) => produce(s, draft => {
    const selectedIdx = draft.scene.objects.findIndex(obj => obj.guid === draft.scene.selectedObjectId);
    if (selectedIdx < 0) {
        return;
    }
    const nextSelected = selectedIdx < draft.scene.objects.length - 1 ? draft.scene.objects[selectedIdx + 1] : selectedIdx > 0 ? draft.scene.objects[selectedIdx - 1] : null;
    if (nextSelected) {
        draft.scene.selectedObjectId = nextSelected.guid;
        nextSelected.selected = true;
    }
    draft.scene.objects.splice(selectedIdx, 1);
}));


export const selectObject = action('selectObject', (s: AppState, data: { guid: string }) => produce(s, draft => {
    const selectedObjet = draft.scene.objects.find(el => el.guid === data.guid);
    if (selectedObjet != null) {
        unselectCurrentDraft(draft);
        selectedObjet.selected = true;
        draft.scene.selectedObjectId = data.guid;
    }
}));

export const unselectCurrent = action('unselectCurrent', (s: AppState) => produce(s, unselectCurrentDraft));

function unselectCurrentDraft(draft: WritableDraft<AppState>) {
    const prev = draft.scene.objects.find(el => el.selected);
    if (prev) {
        prev.selected = false;
    }
    draft.scene.selectedObjectId = null;
}

export const editObject = action('editObject', (s: AppState, data: { guid: string, properties: WorldObjectProperties}) => produce(s, draft => {
    const object = draft.scene.objects.find(el => el.guid === data.guid);
    if (object) {
        object.properties = {...data.properties};
    }
}));

export const raiseSelectedObject = action('raiseSelectedObject', (s: AppState) => produce(s, draft => {
    const objectIndex = draft.scene.objects.findIndex(o => o.guid === draft.scene.selectedObjectId);
    if (objectIndex <= 0) {
        return;
    }
    draft.scene.objects.splice(objectIndex - 1, 2, draft.scene.objects[objectIndex], draft.scene.objects[objectIndex - 1]);
}));
export const lowerSelectedObject = action('lowerSelectedObject', (s: AppState) => produce(s, draft => {
    const objectIndex = draft.scene.objects.findIndex(o => o.guid === draft.scene.selectedObjectId);
    if (objectIndex < 0 || objectIndex === draft.scene.objects.length - 1) {
        return;
    }
    draft.scene.objects.splice(objectIndex, 2, draft.scene.objects[objectIndex + 1], draft.scene.objects[objectIndex]);
}));
