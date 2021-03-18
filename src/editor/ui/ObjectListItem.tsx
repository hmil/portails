import { WorldObject } from 'editor/model/object';
import { editObject, ObjectActions, selectObject } from 'editor/state/actions';
import { produce } from 'immer';
import * as React from 'react';

import { EditableText } from './components/EditableText';
import { ListItem } from './components/ListItem';
import { callback } from './hooks/utils';


export interface ObjectListItemProps {
    object: WorldObject;
    dispatch: React.Dispatch<ObjectActions>;
    fresh: boolean;
}

export function ObjectListItem(props: ObjectListItemProps) {

    const selectCallback = selectObjectCallback(props.dispatch, props.object.guid);
    const changeNameCallback = editObjectNameCallback(props.dispatch, props.object)

    return <ListItem<WorldObject> 
        key={props.object.guid}
        onClick={selectCallback}
        selected={props.object.selected}
    >
        <EditableText height={2} forceEditing={props.fresh ? true : undefined} value={props.object.properties.name} onChange={changeNameCallback}></EditableText>
    </ListItem>;
}

const selectObjectCallback = callback((dispatch: React.Dispatch<ObjectActions>, guid: string) => () => dispatch(selectObject({ guid })));
const editObjectNameCallback = callback((dispatch: React.Dispatch<ObjectActions>, object: WorldObject) => (value: string) => dispatch(editObject(
    produce(object, draft => { draft.properties.name = value; })
)));
