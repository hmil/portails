import { AppActions } from "editor/state/reducer";
import { appInitialState } from "editor/state/state";
import * as React from "react";

export const StateContext = React.createContext({
    state: appInitialState,
    dispatch: (_action: AppActions) => {
        console.error('App context is not set!');
    }
});
