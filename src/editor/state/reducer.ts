import { ActionTypes } from './action-factory';
import * as actions from './actions';
import { AppState } from './state';

export type AppActions = ActionTypes<typeof actions>;

export function appReducer(state: AppState, action: AppActions): AppState {
    // I can't get TypeScript to understand that the union on the left hand side has a type-safe 1:1 mapping with the rhs
    try {
        return (actions[action.type].reduce as any)(state, action.data as any);
    } catch (e) {
        console.error(e);
    }
    return state;
}
