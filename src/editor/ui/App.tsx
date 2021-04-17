import { StateContext } from 'editor/context/StateContext';
import { DeserializerServiceModule } from 'editor/services/DeserializerService';
import { DisplayServiceModule } from 'editor/services/DisplayService';
import { DownloadServiceModule } from 'editor/services/DownloadService';
import { DragAndDropServiceModule } from 'editor/services/DragAndDropService';
import { GridServiceModule } from 'editor/services/GridService';
import { Injector } from 'editor/services/injector';
import { KeyboardShortcutServiceModule } from 'editor/services/KeyboardShortcutService';
import { PersistenceServiceModule } from 'editor/services/PersistenceService';
import { SerializerServiceModule } from 'editor/services/SerializerService';
import { AppActions, appReducer } from 'editor/state/reducer';
import { appInitialState, AppState } from 'editor/state/state';
import * as React from 'react';

import { memo } from './hooks/utils';
import { Workbench } from './Workbench';

export function App() {
    const [ state, dispatch ] = React.useReducer(appReducer, appInitialState);

    return <StateContext.Provider value={getStateProvider(state, dispatch)}>
        <Injector injectors={[
            DisplayServiceModule.injector(() => [state.viewport, state.canvasRect]),
            GridServiceModule.injector(() => [state.gridConfig, DisplayServiceModule.get()]),
            DownloadServiceModule.injector(() => []),
            SerializerServiceModule.injector(() => []),
            DeserializerServiceModule.injector(() => []),
            PersistenceServiceModule.injector(() => [
                state.scene,
                dispatch,
                SerializerServiceModule.get(),
                DeserializerServiceModule.get(),
                DownloadServiceModule.get()
            ]),
            KeyboardShortcutServiceModule.injector(() => [dispatch, PersistenceServiceModule.get()]),
            DragAndDropServiceModule.injector(() => [
                DisplayServiceModule.get(), GridServiceModule.get(), state.grabbedThing, state.scene, dispatch
            ])
        ]}>
            <Workbench></Workbench>
        </Injector>
    </StateContext.Provider>;
}

const getStateProvider = memo((state: AppState, dispatch: React.Dispatch<AppActions>) => ({ state, dispatch}));
