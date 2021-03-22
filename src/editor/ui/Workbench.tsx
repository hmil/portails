import { ServicesContext } from 'editor/context/ServicesContext';
import { StateContext } from 'editor/context/StateContext';
import { AppActions, appReducer } from 'editor/state/reducer';
import { getSelectedSprite } from 'editor/state/selectors';
import { appInitialState, AppState } from 'editor/state/state';
import * as React from 'react';

import { Canvas } from './canvas/Canvas';
import { Dock } from './Dock';
import { memo } from './hooks/utils';
import { ObjectsPanel } from './ObjectsPanel';
import { DisplayService } from '../services/DisplayService';
import { SpriteDetailsPanel } from './SpriteDetailsPanel';
import { SpritesPanel } from './SpritesPanel';
import { Toolbar } from './Toolbar';
import { KeyboardShortcutService } from 'editor/services/KeyboardShortcutService';
import { DownloadService } from 'editor/services/DownloadService';
import { SerializerService } from 'editor/services/SerializerService';
import { DeserializerService } from 'editor/services/DeserializerService';
import { GridService } from 'editor/services/GridService';
import { PersistenceService } from 'editor/services/PersistenceService';

export function Workbench() {

    const [ state, dispatch ] = React.useReducer(appReducer, appInitialState);
    const selectedSprite = getSelectedSprite(state);

    const services = getServicesProvider(appInitialState);

    services.keyboardShortcutService.useKeyboardShortcuts(dispatch);
    services.gridService.sync(state.gridConfig);
    services.persistenceService.sync(state.scene, dispatch);

    return (
        <ServicesContext.Provider value={services}>
            <StateContext.Provider value={getStateProvider(state, dispatch)}>
                <div className="workbench">
                    <Toolbar></Toolbar>
                    <div className="central-container">
                        <Dock>
                            <ObjectsPanel></ObjectsPanel>
                        </Dock>
                        <Canvas></Canvas>
                        <Dock>
                            <SpritesPanel></SpritesPanel>
                            {
                                selectedSprite != null ?
                                    <SpriteDetailsPanel sprite={selectedSprite}></SpriteDetailsPanel> : undefined
                            }
                        </Dock>
                    </div>
                </div>
            </StateContext.Provider>
        </ServicesContext.Provider>
    );
}

const getStateProvider = memo((state: AppState, dispatch: React.Dispatch<AppActions>) => ({ state, dispatch}));

const getServicesProvider = memo((initialState: AppState): ServicesContext => {
    const displayService = new DisplayService(initialState.viewport, { x: 0, y: 0, width: 800, height: 600 });
    const downloadService = new DownloadService();
    const serializerService = new SerializerService();
    const deserializerService = new DeserializerService();
    const persistenceService = new PersistenceService(serializerService, deserializerService, downloadService);
    return {
        displayService,
        keyboardShortcutService: new KeyboardShortcutService(persistenceService),
        downloadService, serializerService, deserializerService, persistenceService,
        gridService: new GridService(initialState.gridConfig, displayService),
    };
});