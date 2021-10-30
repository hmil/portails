import { worldObjectDefaults, WorldObjectProperties } from "editor/model/object";
import produce from "immer";
import { action } from "../action-factory";
import { AppState } from "../state";

export const createObject = action('createObject', (s: AppState, data: { guid: string, properties?: Partial<WorldObjectProperties> }) => produce(s, draft => {
    draft.scene.selection = { type: 'object', objectId: data.guid };
    const newObject = worldObjectDefaults(data.guid);
    newObject.properties.name = 'New Object ' + data.guid;
    if (data.properties) {
        newObject.properties = {
            ...newObject.properties,
            ...data.properties
        };
    }
    draft.scene.objects.push(newObject);
}));

export const deleteSelectedObjects = action('deleteSelectedObjects', (s: AppState) => produce(s, draft => {
    draft.scene.objects = draft.scene.objects.filter(obj => draft.scene.selection?.objectId !== obj.guid);
}));


export const selectObject = action('selectObject', (s: AppState, data: { guid: string }) => produce(s, draft => {
    const selectedObjet = draft.scene.objects.find(el => el.guid === data.guid);
    if (selectedObjet != null) {
        draft.scene.selection = { type: 'object', objectId: data.guid };
    }
}));

export const editObject = action('editObject', (s: AppState, data: { guid: string, properties: WorldObjectProperties}) => produce(s, draft => {
    const object = draft.scene.objects.find(el => el.guid === data.guid);
    if (object) {
        object.properties = {...data.properties};
    }
}));

export const raiseSelectedObject = action('raiseSelectedObject', (s: AppState) => produce(s, draft => {
    const objectIndex = draft.scene.objects.findIndex(o => o.guid === s.scene.selection?.objectId);
    if (objectIndex > 0) {
        draft.scene.objects.splice(objectIndex - 1, 2, draft.scene.objects[objectIndex], draft.scene.objects[objectIndex - 1]);
    }
}));

export const lowerSelectedObject = action('lowerSelectedObject', (s: AppState) => produce(s, draft => {
    const objectIndex = draft.scene.objects.findIndex(o => o.guid === s.scene.selection?.objectId);
    if (objectIndex >= 0 && objectIndex !== draft.scene.objects.length - 1) {
        draft.scene.objects.splice(objectIndex, 2, draft.scene.objects[objectIndex + 1], draft.scene.objects[objectIndex]);
    }
}));

export const removeSelectedObject = action('removeSelectedObject', (s: AppState) => produce(s, draft => {
    const selection = s.scene.selection;
    if (selection?.type !== 'object') {
        return;
    }
    draft.scene.objects = draft.scene.objects.filter(o => o.guid !== selection.objectId);
    draft.scene.selection = null;
}));

