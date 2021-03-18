import { AppActions } from "editor/state/reducer";
import { appInitialState } from "editor/state/state";
import * as React from "react";

export const StateContext = React.createContext({
    state: appInitialState,
    dispatch: (_action: AppActions) => {
        console.error('Hex view context is not set!');
    }
});
