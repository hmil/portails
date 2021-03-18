import { worldObjectDefaults, WorldObjectProperties } from "editor/model/object";
import produce from "immer";
import { WritableDraft } from "immer/dist/internal";
import { action } from "../action-factory";
import { AppState } from "../state";

export const createObject = action('createObject', (s: AppState, data: { guid: string }) => produce(s, draft => {
    unselectCurrentDraft(draft);
    draft.selectedObjectId = data.guid;
    const newObject = worldObjectDefaults(data.guid);
    newObject.properties.name = 'New Object ' + data.guid;
    newObject.selected = true;
    draft.objects.push(newObject);
}));

export const deleteSelectedObject = action('deleteSelectedObject', (s: AppState) => produce(s, draft => {
    const selectedIdx = draft.objects.findIndex(obj => obj.guid === draft.selectedObjectId);
    if (selectedIdx < 0) {
        return;
    }
    const nextSelected = selectedIdx < draft.objects.length - 1 ? draft.objects[selectedIdx + 1] : selectedIdx > 0 ? draft.objects[selectedIdx - 1] : null;
    if (nextSelected) {
        draft.selectedObjectId = nextSelected.guid;
        nextSelected.selected = true;
    }
    draft.objects.splice(selectedIdx, 1);
}));


export const selectObject = action('selectObject', (s: AppState, data: { guid: string }) => produce(s, draft => {
    const selectedObjet = draft.objects.find(el => el.guid === data.guid);
    if (selectedObjet != null) {
        unselectCurrentDraft(draft);
        selectedObjet.selected = true;
        draft.selectedObjectId = data.guid;
    }
}));

export const unselectCurrent = action('unselectCurrent', (s: AppState) => produce(s, unselectCurrentDraft));

function unselectCurrentDraft(draft: WritableDraft<AppState>) {
    const prev = draft.objects.find(el => el.selected);
    if (prev) {
        prev.selected = false;
    }
    draft.selectedObjectId = null;
}

export const editObject = action('editObject', (s: AppState, data: { guid: string, properties: WorldObjectProperties}) => produce(s, draft => {
    const object = draft.objects.find(el => el.guid === data.guid);
    if (object) {
        object.properties = {...data.properties};
    }
}));

export const raiseSelectedObject = action('raiseSelectedObject', (s: AppState) => produce(s, draft => {
    const objectIndex = draft.objects.findIndex(o => o.guid === draft.selectedObjectId);
    if (objectIndex <= 0) {
        return;
    }
    draft.objects.splice(objectIndex - 1, 2, draft.objects[objectIndex], draft.objects[objectIndex - 1]);
}));
export const lowerSelectedObject = action('lowerSelectedObject', (s: AppState) => produce(s, draft => {
    const objectIndex = draft.objects.findIndex(o => o.guid === draft.selectedObjectId);
    if (objectIndex < 0 || objectIndex === draft.objects.length - 1) {
        return;
    }
    draft.objects.splice(objectIndex, 2, draft.objects[objectIndex + 1], draft.objects[objectIndex]);
}));
