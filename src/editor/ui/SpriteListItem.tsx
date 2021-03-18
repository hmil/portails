import { WorldObject } from 'editor/model/object';
import { ObjectSprite } from 'editor/model/sprite';
import { editSprite, selectSprite, SpriteActions } from 'editor/state/actions';
import { produce } from 'immer';
import * as React from 'react';

import { EditableText } from './components/EditableText';
import { ListItem } from './components/ListItem';
import { callback } from './hooks/utils';


export interface SpriteListItemProps {
    sprite: ObjectSprite;
    dispatch: React.Dispatch<SpriteActions>;
    fresh: boolean;
}

export function SpriteListItem(props: SpriteListItemProps) {

    const selectCallback = selectSpriteCallback(props.dispatch, props.sprite);
    const changeNameCallback = editSpriteNameCallback(props.dispatch, props.sprite)

    return <ListItem<WorldObject> 
        key={props.sprite.spriteId}
        onClick={selectCallback}
        selected={props.sprite.selected}
    >
        <EditableText forceEditing={props.fresh ? true : undefined} value={props.sprite.properties.name} onChange={changeNameCallback}></EditableText>
    </ListItem>;
}

const selectSpriteCallback = callback((dispatch: React.Dispatch<SpriteActions>, sprite: ObjectSprite) => () => dispatch(selectSprite(sprite)));
const editSpriteNameCallback = callback((dispatch: React.Dispatch<SpriteActions>, sprite: ObjectSprite) => (value: string) => dispatch(editSprite(
    produce(sprite, draft => {
        draft.properties.name = value;
    })
)));
