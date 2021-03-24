import { geometryDefaults, ObjectGeometry, Vertex } from 'editor/model/geometry';
import { computeObjectBoundingBox, WorldObject } from 'editor/model/object';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';

import { action } from '../action-factory';
import { AppState } from '../state';

export const editChain = action('editChain', (s: AppState, data: { ownerId: string, chainId: string, vertices: ReadonlyArray<Vertex> }) => produce(s, draft => {
    const owner = draft.scene.objects.find(o => o.guid === data.ownerId);
    const geometry = owner?.geometries.find(g => g.geometryId === data.chainId);
    if (owner != null && geometry != null) {
        geometry.vertices = [...data.vertices];
        owner.boundingBox = computeObjectBoundingBox(owner);
    }
}));

export const selectGeometry = action('selectGeometry', (s: AppState, data: { ownerId: string, geometryId: string }) => produce(s, draft => {
    draft.scene.selection = { type: 'geometry', objectId: data.ownerId, geometryId: data.geometryId };
}));

export const prependVertexToCurrentChain = action('prependVertexToCurrentChain', (s: AppState) => produce(s, draft => {
    const selection = s.scene.selection;
    if (selection?.type !== 'geometry') {
        return;
    }
    const owner = draft.scene.objects.find(o => o.guid === selection.objectId);
    if (owner == null) {
        return
    }
    const geometry = owner.geometries.find(g => g.geometryId === selection.geometryId);
    geometry?.vertices.unshift({
        x: 0, y: 0
    });
    owner.boundingBox = computeObjectBoundingBox(owner);
}));

export const appendVertexToCurrentChain = action('appendVertexToCurrentChain', (s: AppState) => produce(s, draft => {
    const selection = s.scene.selection;
    if (selection?.type !== 'geometry') {
        return;
    }
    const owner = draft.scene.objects.find(o => o.guid === selection.objectId);
    if (owner == null) {
        return
    }
    const geometry = owner.geometries.find(g => g.geometryId === selection.geometryId);
    geometry?.vertices.push({
        x: 0, y: 0
    });
    owner.boundingBox = computeObjectBoundingBox(owner);
}));

export const createGeometry = action('createGeometry', (s: AppState, data: { ownerId: string, geometryId: string }) => produce(s, draft => {
    const owner = getOwner(draft, data.ownerId);
    const newGeometry = geometryDefaults(data.ownerId, data.geometryId);
    newGeometry.name = 'New Geometry ' + data.geometryId;
    owner.geometries.push(newGeometry);
    draft.scene.selection = { type: 'geometry', objectId: data.ownerId, geometryId: data.geometryId };
    owner.boundingBox = computeObjectBoundingBox(owner);
}));

export const editGeometryName = action('editGeometryName', (s: AppState, data: Pick<ObjectGeometry, 'geometryId' | 'ownerId' | 'name'>) => produce(s, draft => {
    const owner = getOwner(draft, data.ownerId);
    const geometry = owner.geometries.find(geometr => geometr.geometryId === data.geometryId);
    if (geometry) {
        geometry.name = data.name;
    }
    owner.boundingBox = computeObjectBoundingBox(owner);
}));

export const removeSelectedGeometry = action('removeSelectedGeometry', (s: AppState) => produce(s, draft => {
    const selection = s.scene.selection;
    if (selection?.type !== 'geometry') {
        return;
    }
    const owner = getOwner(draft, selection.objectId);
    owner.geometries = owner.geometries.filter(g => g.geometryId !== selection.geometryId);
    draft.scene.selection = { type: 'object', objectId: selection.objectId };
}));

function getOwner(draft: WritableDraft<AppState>, ownerId: string): WritableDraft<WorldObject> {
    const owner = draft.scene.objects.find(o => o.guid === ownerId);
    if (owner == null) {
        throw new Error('No owner')
    }
    return owner;
}