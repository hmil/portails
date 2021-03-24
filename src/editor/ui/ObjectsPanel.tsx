import { StateContext } from 'editor/context/StateContext';
import { WorldObject } from 'editor/model/object';
import { createObject, deleteSelectedObjects, lowerSelectedObject, pushSceneToUndoStack, raiseSelectedObject } from 'editor/state/actions';
import { AppActions } from 'editor/state/reducer';
import { uniqId } from 'editor/utils/uid';
import * as React from 'react';

import { Button } from './components/Button';
import { List } from './components/List';
import { ObjectListItem } from './ObjectListItem';
import { callback } from './hooks/utils';
import { useFresh } from './hooks/useFresh';
import { Panel } from './Panel';
import { SceneSelection } from 'editor/state/state';

export function ObjectsPanel() {
    const { state, dispatch } = React.useContext(StateContext);

    const [ freshObject, setFreshObject ] = useFresh();

    return <Panel title="Scene">
        <div className="objects-panel">
            <div className="list-container">
                <List renderItem={renderItemCallback(dispatch, state.scene.selection, freshObject)} data={state.scene.objects}></List>
            </div>
            <div className="actions-container">
                <Button onClick={createObjectCallback(dispatch, setFreshObject)} value="+" tooltip="Add object"></Button>
                <Button onClick={deleteObjectCallback(dispatch)} value="-" tooltip="Add object"></Button>
                <Button onClick={raiseObjectCallback(dispatch)} value="▲" tooltip="Move object up"></Button>
                <Button onClick={lowerObjectCallback(dispatch)} value="▼" tooltip="Move object down"></Button>
            </div>
        </div>
    </Panel>
}

const createObjectCallback = callback((dispatch: React.Dispatch<AppActions>, setFreshObject: (object: string) => void) => () => {
    const guid = String(uniqId());
    setFreshObject(guid);
    dispatch(pushSceneToUndoStack());
    dispatch(createObject({ guid }));
});
const deleteObjectCallback = callback((dispatch: React.Dispatch<AppActions>) => () => {
    dispatch(pushSceneToUndoStack());
    dispatch(deleteSelectedObjects());
});
const raiseObjectCallback = callback((dispatch: React.Dispatch<AppActions>) => () => {
    dispatch(pushSceneToUndoStack());
    dispatch(raiseSelectedObject());
});
const lowerObjectCallback = callback((dispatch: React.Dispatch<AppActions>) => () => {
    dispatch(pushSceneToUndoStack());
    dispatch(lowerSelectedObject());
});


const renderItemCallback = callback((dispatch: React.Dispatch<AppActions>, selection: SceneSelection, freshObject: string | null) => (object: WorldObject) =>
    <ObjectListItem selection={selection} fresh={freshObject === object.guid} dispatch={dispatch} object={object} key={object.guid}></ObjectListItem>);
