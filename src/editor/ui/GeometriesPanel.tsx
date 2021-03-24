import { StateContext } from 'editor/context/StateContext';
import { ObjectGeometry } from 'editor/model/geometry';
import { createGeometry, createSprite, pushSceneToUndoStack, removeSelectedGeometry } from 'editor/state/actions';
import { AppActions } from 'editor/state/reducer';
import { getSelectedObject } from 'editor/state/selectors';
import { SceneSelection } from 'editor/state/state';
import { uniqId } from 'editor/utils/uid';
import * as React from 'react';

import { Button } from './components/Button';
import { List } from './components/List';
import { GeometryListItem } from './GeometryListItem';
import { useFresh } from './hooks/useFresh';
import { callback } from './hooks/utils';

export function GeometriesPanel() {
    const { dispatch, state } = React.useContext(StateContext);

    const [ fresh, setFresh ] = useFresh();

    const selectedObject = getSelectedObject(state);
    const renderListItem = renderItemCallback(dispatch, state.scene.selection, fresh);

    return <div className="properties-panel">
        { selectedObject == null ? 'Select an object to see its geometries.' : <>
            <div className="list-container">
                <List renderItem={renderListItem} data={selectedObject.geometries}></List>
            </div>
            <div className="actions-container">
                <Button onClick={() => {
                    const guid = String(uniqId());
                    setFresh(guid);
                    dispatch(pushSceneToUndoStack());
                    dispatch(createGeometry({
                        ownerId: selectedObject?.guid,
                        geometryId: guid
                    }));
                }} value="+" tooltip="Add geometry"></Button>
                <Button disabled={state.scene.selection?.type !== 'geometry'} onClick={() => {
                    dispatch(pushSceneToUndoStack());
                    dispatch(removeSelectedGeometry());
                }} value="-" tooltip="Remove geometry"></Button>
            </div>
        </> }
    </div>;
}

const renderItemCallback = callback((dispatch: React.Dispatch<AppActions>, selection: SceneSelection, fresh: string | null) => (geometry: ObjectGeometry) =>
    <GeometryListItem selected={selection?.type === 'geometry' && selection.geometryId === geometry.geometryId} fresh={fresh === geometry.geometryId} dispatch={dispatch} geometry={geometry} key={geometry.geometryId}></GeometryListItem>);
