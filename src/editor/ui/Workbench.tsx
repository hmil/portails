import { ServicesContext } from 'editor/context/ServicesContext';
import { StateContext } from 'editor/context/StateContext';
import { DeserializerService } from 'editor/services/DeserializerService';
import { DownloadService } from 'editor/services/DownloadService';
import { GridService } from 'editor/services/GridService';
import { KeyboardShortcutService } from 'editor/services/KeyboardShortcutService';
import { PersistenceService } from 'editor/services/PersistenceService';
import { SerializerService } from 'editor/services/SerializerService';
import { getSelectedSprite } from 'editor/state/selectors';
import { appInitialState, AppState } from 'editor/state/state';
import * as React from 'react';

import { DisplayService } from '../services/DisplayService';
import { Canvas } from './canvas/Canvas';
import { Dock } from './Dock';
import { memo } from './hooks/utils';
import { ObjectDetailsPanel } from './ObjectDetailsPanel';
import { ObjectsPanel } from './ObjectsPanel';
import { SpriteDetailsPanel } from './SpriteDetailsPanel';
import { Toolbar } from './Toolbar';

export function Workbench() {
    const { state, dispatch } = React.useContext(StateContext);
    const selectedSprite = getSelectedSprite(state);

    const services = getServicesProvider(appInitialState);

    services.keyboardShortcutService.useKeyboardShortcuts(dispatch, state.scene.selection);
    services.gridService.sync(state.gridConfig);
    services.persistenceService.sync(state.scene, dispatch);

    return (
        <ServicesContext.Provider value={services}>
            <div className="workbench">
                <Toolbar></Toolbar>
                <div className="central-container">
                    <Dock>
                        <ObjectsPanel></ObjectsPanel>
                    </Dock>
                    <Canvas></Canvas>
                    <Dock>
                        <ObjectDetailsPanel></ObjectDetailsPanel>
                        {
                            selectedSprite != null ?
                                <SpriteDetailsPanel sprite={selectedSprite}></SpriteDetailsPanel> : undefined
                        }
                    </Dock>
                </div>
            </div>
        </ServicesContext.Provider>
    );
}

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