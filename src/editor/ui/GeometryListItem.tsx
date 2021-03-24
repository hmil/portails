import { ObjectGeometry } from 'editor/model/geometry';
import { WorldObject } from 'editor/model/object';
import { editGeometryName, GeometryActions, pushSceneToUndoStack, selectGeometry, SpriteActions, UndoActions } from 'editor/state/actions';
import produce from 'immer';
import * as React from 'react';

import { EditableText } from './components/EditableText';
import { ListItem } from './components/ListItem';
import { callback } from './hooks/utils';


export interface GeometryListItemProps {
    geometry: ObjectGeometry;
    selected: boolean;
    dispatch: React.Dispatch<GeometryActions | UndoActions>;
    fresh: boolean;
}

export function GeometryListItem(props: GeometryListItemProps) {

    const selectCallback = selectGeometryCallback(props.dispatch, props.geometry);
    const changeNameCallback = editGeometryNameCallback(props.dispatch, props.geometry)

    return <ListItem 
        onClick={selectCallback}
        selected={props.selected}
    >
        <EditableText forceEditing={props.fresh ? true : undefined} value={props.geometry.name} onChange={changeNameCallback}></EditableText>
    </ListItem>;
}

const selectGeometryCallback = callback((dispatch: React.Dispatch<GeometryActions>, geometry: ObjectGeometry) => () => dispatch(selectGeometry(geometry)));
const editGeometryNameCallback = callback((dispatch: React.Dispatch<GeometryActions | UndoActions>, geometry: ObjectGeometry) => (value: string) => {
    if (value === geometry.name) { return; }
    dispatch(pushSceneToUndoStack());
    dispatch(editGeometryName(
        produce(geometry, draft => {
            draft.name = value;
        })
    ));
});
