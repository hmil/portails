import { WorldObject } from 'editor/model/object';
import { ObjectSprite } from 'editor/model/sprite';
import { editSprite, pushSceneToUndoStack, selectSprite, SpriteActions, UndoActions } from 'editor/state/actions';
import { produce } from 'immer';
import * as React from 'react';

import { EditableText } from './components/EditableText';
import { ListItem } from './components/ListItem';
import { callback } from './hooks/utils';


export interface SpriteListItemProps {
    sprite: ObjectSprite;
    selected: boolean;
    dispatch: React.Dispatch<SpriteActions | UndoActions>;
    fresh: boolean;
}

export function SpriteListItem(props: SpriteListItemProps) {

    const selectCallback = selectSpriteCallback(props.dispatch, props.sprite);
    const changeNameCallback = editSpriteNameCallback(props.dispatch, props.sprite);

    return <ListItem
        onClick={selectCallback}
        selected={props.selected}
    >
        <img className="sprite-miniature" src={props.sprite.properties.src} />
        <EditableText onFocus={() => props.dispatch(selectSprite(props.sprite))} forceEditing={props.fresh} value={props.sprite.properties.name} onChange={changeNameCallback}></EditableText>
    </ListItem>;
}

const selectSpriteCallback = callback((dispatch: React.Dispatch<SpriteActions>, sprite: ObjectSprite) => () => dispatch(selectSprite(sprite)));
const editSpriteNameCallback = callback((dispatch: React.Dispatch<SpriteActions | UndoActions>, sprite: ObjectSprite) => (value: string) => {
    if (value === sprite.properties.name) { return; }
    dispatch(pushSceneToUndoStack());
    dispatch(editSprite(
        produce(sprite, draft => {
            draft.properties.name = value;
        })
    ));
});
