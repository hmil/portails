import { computeObjectBoundingBox, WorldObject } from 'editor/model/object';
import { ObjectSpriteProperties, spriteDefaults } from 'editor/model/sprite';
import { uniqId } from 'editor/utils/uid';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';

import { action } from '../action-factory';
import { AppState } from '../state';

export const createSprite = action('createSprite', (s: AppState, data: { ownerId: string, spriteId: string }) => produce(s, draft => {
    const owner = getOwner(draft, data.ownerId);
    const newSprite = spriteDefaults(data.ownerId, data.spriteId);
    newSprite.properties.name = 'New Sprite ' + data.spriteId;
    owner.sprites.push(newSprite);
    draft.scene.selection = { type: 'sprite', objectId: data.ownerId, spriteId: data.spriteId };
    owner.boundingBox = computeObjectBoundingBox(owner);
}));

export const editSprite = action('editSprite', (s: AppState, data: { ownerId: string, spriteId: string, properties: ObjectSpriteProperties}) => produce(s, draft => {
    const owner = getOwner(draft, data.ownerId);
    const sprite = owner.sprites.find(sprite => sprite.spriteId === data.spriteId);
    if (sprite) {
        sprite.properties = data.properties;
    }
    owner.boundingBox = computeObjectBoundingBox(owner);
}));

export const selectSprite = action('selectSprite', (s: AppState, data: { ownerId: string, spriteId: string }) => produce(s, draft => {
    draft.scene.selection = { type: 'sprite', objectId: data.ownerId, spriteId: data.spriteId };
}));

export const removeSelectedSprite = action('removeSelectedSprite', (s: AppState) => produce(s, draft => {
    const selection = s.scene.selection;
    if (selection?.type !== 'sprite') {
        return;
    }
    const owner = getOwner(draft, selection.objectId);
    owner.sprites = owner.sprites.filter(s => s.spriteId !== selection.spriteId);
    draft.scene.selection = { type: 'object', objectId: selection.objectId };
}));

export const duplicateSelectedSprite = action('duplicateSelectedSprite', (s: AppState, data: { newId: string }) => produce(s, draft => {
    const selection = s.scene.selection;
    if (selection?.type !== 'sprite') {
        return;
    }
    const owner = getOwner(draft, selection.objectId);
    const sprite = owner.sprites.find(s => s.spriteId === selection.spriteId);
    if (sprite == null) {
        return;
    }
    const newSprite = produce(sprite, spriteDraft => {
        spriteDraft.properties.name = createNameDuplicate(sprite.properties.name);
        spriteDraft.spriteId = data.newId;
        spriteDraft.properties.transform.x += 0.5;
        spriteDraft.properties.transform.y += 0.25;
    });
    owner.sprites.push(newSprite);
    draft.scene.selection = { type: 'sprite', objectId: selection.objectId, spriteId: data.newId };
}));


function createNameDuplicate(name: string) {
    const match = name.match(/^(.+)(\d+)$/);
    if (match == null) {
        return `${name} 1`;
    }
    const number = Number(match[2]);
    return match[1] + (number + 1);
}

function getOwner(draft: WritableDraft<AppState>, ownerId: string): WritableDraft<WorldObject> {
    const owner = draft.scene.objects.find(o => o.guid === ownerId);
    if (owner == null) {
        throw new Error('No owner')
    }
    return owner;
}

