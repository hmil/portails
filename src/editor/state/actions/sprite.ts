import { computeObjectBoundingBox, WorldObject } from 'editor/model/object';
import { ObjectSpriteProperties, spriteDefaults } from 'editor/model/sprite';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';

import { action } from '../action-factory';
import { AppState } from '../state';

export const createSprite = action('createSprite', (s: AppState, data: { ownerId: string, spriteId: string }) => produce(s, draft => {
    const owner = getOwner(draft, data.ownerId);
    unselectCurrentSprite(owner);
    const newSprite = spriteDefaults(data.ownerId, data.spriteId);
    newSprite.properties.name = 'New Sprite ' + data.spriteId;
    newSprite.selected = true;
    owner.sprites.push(newSprite);
    owner.boundingBox = computeObjectBoundingBox(owner.sprites);
}));

export const editSprite = action('editSprite', (s: AppState, data: { ownerId: string, spriteId: string, properties: ObjectSpriteProperties}) => produce(s, draft => {
    const owner = getOwner(draft, data.ownerId);
    const sprite = owner.sprites.find(sprite => sprite.spriteId === data.spriteId);
    if (sprite) {
        sprite.properties = data.properties;
    }
    owner.boundingBox = computeObjectBoundingBox(owner.sprites);
}));

export const selectSprite = action('selectSprite', (s: AppState, data: { ownerId: string, spriteId: string }) => produce(s, draft => {
    const owner = getOwner(draft, data.ownerId);
    const selectedSprite = owner.sprites.find(el => el.spriteId === data.spriteId);
    if (selectedSprite != null) {
        unselectCurrentSprite(owner);
        selectedSprite.selected = true;
    }
    owner.boundingBox = computeObjectBoundingBox(owner.sprites);
}));



function getOwner(draft: WritableDraft<AppState>, ownerId: string): WritableDraft<WorldObject> {
    const owner = draft.scene.objects.find(o => o.guid === ownerId);
    if (owner == null) {
        throw new Error('No owner')
    }
    return owner;
}

function unselectCurrentSprite(draft: WritableDraft<WorldObject>) {
    const prev = draft.sprites.find(el => el.selected);
    if (prev) {
        prev.selected = false;
    }
}

