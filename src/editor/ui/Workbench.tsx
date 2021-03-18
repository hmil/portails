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
import { DisplayService } from './services/DisplayService';
import { SpriteDetailsPanel } from './SpriteDetailsPanel';
import { SpritesPanel } from './SpritesPanel';
import { Toolbar } from './Toolbar';

export function Workbench() {

    const [ state, dispatch ] = React.useReducer(appReducer, appInitialState);
    const selectedSprite = getSelectedSprite(state);

    return (
        <ServicesContext.Provider value={getServicesProvider(appInitialState)}>
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
    return {
        displayService: new DisplayService(initialState.viewport, { x: 0, y: 0, width: 800, height: 600 })
    };
});