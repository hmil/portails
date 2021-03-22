import { ServicesContext } from "editor/context/ServicesContext";
import { StateContext } from "editor/context/StateContext";
import { loadScene, toggleGridSnapping } from "editor/state/actions";
import { popSceneFromRedoStack, popSceneFromUndoStack } from "editor/state/actions/undo";
import { AppActions } from "editor/state/reducer";
import * as React from "react";
import { Button } from "./components/Button";
import { callback } from "./hooks/utils";

export function Toolbar() {
    const { state, dispatch } = React.useContext(StateContext);
    const { persistenceService } = React.useContext(ServicesContext);


    return (
        <div className="toolbar">
            <Button onClick={() => dispatch(popSceneFromUndoStack())} value="↩" disabled={state.undoStack == null}></Button>
            <Button onClick={() => dispatch(popSceneFromRedoStack())} value="↪" disabled={state.redoStack == null}></Button>
            <Button onClick={persistenceService.save} value="💾"></Button>
            <Button onClick={persistenceService.load} value="⬇️"></Button>
            <Button onClick={toggleGridCallback(dispatch)} value="✨" active={state.gridConfig.enabled}></Button>
        </div>
    );
}

const toggleGridCallback = callback((dispatch: React.Dispatch<AppActions>) => (evt: React.MouseEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
    dispatch(toggleGridSnapping())
});