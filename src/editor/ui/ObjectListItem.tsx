import { WorldObject } from 'editor/model/object';
import { editObject, ObjectActions, pushSceneToUndoStack, selectObject, UndoActions } from 'editor/state/actions';
import { SceneSelection } from 'editor/state/state';
import { produce } from 'immer';
import * as React from 'react';

import { EditableText } from './components/EditableText';
import { ListItem } from './components/ListItem';
import { callback } from './hooks/utils';


export interface ObjectListItemProps {
    object: WorldObject;
    selection: SceneSelection;
    dispatch: React.Dispatch<ObjectActions | UndoActions>;
    fresh: boolean;
}

export function ObjectListItem(props: ObjectListItemProps) {

    const selectCallback = selectObjectCallback(props.dispatch, props.object.guid);
    const changeNameCallback = editObjectNameCallback(props.dispatch, props.object)

    return <ListItem 
        key={props.object.guid}
        onClick={selectCallback}
        selected={props.selection?.objectId === props.object.guid}
    >
        <EditableText height={2} forceEditing={props.fresh ? true : undefined} value={props.object.properties.name} onChange={changeNameCallback}></EditableText>
    </ListItem>;
}

const selectObjectCallback = callback((dispatch: React.Dispatch<ObjectActions>, guid: string) => () => dispatch(selectObject({ guid })));
const editObjectNameCallback = callback((dispatch: React.Dispatch<ObjectActions | UndoActions>, object: WorldObject) => (value: string) => {
    if (value === object.properties.name) { return; }
    dispatch(pushSceneToUndoStack());
    dispatch(editObject(produce(object, draft => { draft.properties.name = value; })));
});
