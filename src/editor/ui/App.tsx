import { StateContext } from 'editor/context/StateContext';
import { AppActions, appReducer } from 'editor/state/reducer';
import { appInitialState, AppState } from 'editor/state/state';
import * as React from 'react';

import { memo } from './hooks/utils';
import { Workbench } from './Workbench';

export function App() {
    const [ state, dispatch ] = React.useReducer(appReducer, appInitialState);

    return <StateContext.Provider value={getStateProvider(state, dispatch)}>
        <Workbench></Workbench>
    </StateContext.Provider>;
}

const getStateProvider = memo((state: AppState, dispatch: React.Dispatch<AppActions>) => ({ state, dispatch}));
