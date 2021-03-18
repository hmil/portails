import { StateContext } from 'editor/context/StateContext';
import { WorldObject } from 'editor/model/object';
import { createObject, deleteSelectedObject, lowerSelectedObject, raiseSelectedObject } from 'editor/state/actions';
import { AppActions } from 'editor/state/reducer';
import { uniqId } from 'editor/utils/uid';
import * as React from 'react';

import { Button } from './components/Button';
import { List } from './components/List';
import { ObjectListItem } from './ObjectListItem';
import { callback } from './hooks/utils';
import { useFresh } from './hooks/useFresh';
import { Panel } from './Panel';

export function ObjectsPanel() {
    const { state, dispatch } = React.useContext(StateContext);

    const [ freshObject, setFreshObject ] = useFresh();

    return <Panel title="Objects">
        <div className="objects-panel">
            <div className="list-container">
                <List renderItem={renderItemCallback(dispatch, freshObject)} data={state.objects}></List>
            </div>
            <div className="actions-container">
                <Button onClick={createObjectCallback(dispatch, setFreshObject)} value="+" tooltip="Add object"></Button>
                <Button onClick={deleteObjectCallback(dispatch)} value="-" tooltip="Add object"></Button>
                <Button onClick={raiseObjectCallback(dispatch)} value="up" tooltip="Move object up"></Button>
                <Button onClick={lowerObjectCallback(dispatch)} value="down" tooltip="Move object down"></Button>
            </div>
        </div>
    </Panel>
}

const createObjectCallback = callback((dispatch: React.Dispatch<AppActions>, setFreshObject: (object: string) => void) => () => {
    const guid = String(uniqId());
    setFreshObject(guid);
    dispatch(createObject({ guid }));
});
const deleteObjectCallback = callback((dispatch: React.Dispatch<AppActions>) => () => {
    dispatch(deleteSelectedObject());
});
const raiseObjectCallback = callback((dispatch: React.Dispatch<AppActions>) => () => {
    dispatch(raiseSelectedObject());
});
const lowerObjectCallback = callback((dispatch: React.Dispatch<AppActions>) => () => {
    dispatch(lowerSelectedObject());
});


const renderItemCallback = callback((dispatch: React.Dispatch<AppActions>, freshObject: string | null) => (object: WorldObject) =>
    <ObjectListItem fresh={freshObject === object.guid} dispatch={dispatch} object={object} key={object.guid}></ObjectListItem>);
