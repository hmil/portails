import { defaultBoundingBox, WorldObject } from 'editor/model/object';
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
    updateOwnerBoundingBox(owner);
}));

export const editSprite = action('editSprite', (s: AppState, data: { ownerId: string, spriteId: string, properties: ObjectSpriteProperties}) => produce(s, draft => {
    const owner = getOwner(draft, data.ownerId);
    const sprite = owner.sprites.find(sprite => sprite.spriteId === data.spriteId);
    if (sprite) {
        sprite.properties = data.properties;
    }
    updateOwnerBoundingBox(owner);
}));

export const selectSprite = action('selectSprite', (s: AppState, data: { ownerId: string, spriteId: string }) => produce(s, draft => {
    const owner = getOwner(draft, data.ownerId);
    const selectedSprite = owner.sprites.find(el => el.spriteId === data.spriteId);
    if (selectedSprite != null) {
        unselectCurrentSprite(owner);
        selectedSprite.selected = true;
    }
    updateOwnerBoundingBox(owner);
}));


function updateOwnerBoundingBox(owner: WritableDraft<WorldObject>) {
    let left = 0;
    let top = 0;
    let right = 0;
    let bottom = 0;

    if (owner.sprites.length === 0) {
        owner.boundingBox = defaultBoundingBox();
        return;
    }

    owner.sprites.forEach(sprite => {
        const trsf = sprite.properties.transform;
        if (trsf.x - trsf.scaleX/2 < left) left = trsf.x - trsf.scaleX/2;
        if (trsf.y - trsf.scaleY/2 < top) top = trsf.y - trsf.scaleY/2;
        if (trsf.x + trsf.scaleX/2 > right) right = trsf.x + trsf.scaleX/2;
        if (trsf.y + trsf.scaleY/2 > bottom) bottom = trsf.y + trsf.scaleY/2;
    });

    owner.boundingBox = { left, top, right, bottom };
}

function getOwner(draft: WritableDraft<AppState>, ownerId: string): WritableDraft<WorldObject> {
    const owner = draft.objects.find(o => o.guid === ownerId);
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

