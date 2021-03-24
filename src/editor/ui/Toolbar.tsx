import { ServicesContext } from 'editor/context/ServicesContext';
import { StateContext } from 'editor/context/StateContext';
import { appendVertexToCurrentChain, prependVertexToCurrentChain, toggleGridSnapping } from 'editor/state/actions';
import { popSceneFromRedoStack, popSceneFromUndoStack, pushSceneToUndoStack } from 'editor/state/actions/undo';
import { AppActions } from 'editor/state/reducer';
import * as React from 'react';

import { Button } from './components/Button';
import { callback } from './hooks/utils';

export function Toolbar() {
    const { state, dispatch } = React.useContext(StateContext);
    const { persistenceService } = React.useContext(ServicesContext);

    const isGeometrySelection = state.scene.selection?.type === 'geometry';

    return (
        <div className="toolbar">
            <Button onClick={() => dispatch(popSceneFromUndoStack())} value="↩" disabled={state.undoStack == null}></Button>
            <Button onClick={() => dispatch(popSceneFromRedoStack())} value="↪" disabled={state.redoStack == null}></Button>
            <Button onClick={persistenceService.save} value="💾"></Button>
            <Button onClick={persistenceService.load} value="⬇️"></Button>
            <Button onClick={toggleGridCallback(dispatch)} value="✨" active={state.gridConfig.enabled}></Button>
            <Button onClick={prependVertexCallback(dispatch)} value="🔸" disabled={!isGeometrySelection}></Button>
            <Button onClick={appendVertexCallback(dispatch)} value="🔹" disabled={!isGeometrySelection}></Button>
        </div>
    );
}

const toggleGridCallback = callback((dispatch: React.Dispatch<AppActions>) => (evt: React.MouseEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
    dispatch(toggleGridSnapping())
});

const prependVertexCallback = callback((dispatch: React.Dispatch<AppActions>) => (evt: React.MouseEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
    dispatch(pushSceneToUndoStack());
    dispatch(prependVertexToCurrentChain());
});

const appendVertexCallback = callback((dispatch: React.Dispatch<AppActions>) => (evt: React.MouseEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
    dispatch(pushSceneToUndoStack());
    dispatch(appendVertexToCurrentChain());
});