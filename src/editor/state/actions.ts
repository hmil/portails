import { ActionTypes } from './action-factory';
import * as objectActions from './actions/object';
import * as spriteActions from './actions/sprite';
import * as viewportActions from './actions/viewport';

export * from './actions/object';
export type ObjectActions = ActionTypes<typeof objectActions>;

export * from './actions/sprite';
export type SpriteActions = ActionTypes<typeof spriteActions>;

export * from './actions/viewport';
export type ViewportActions = ActionTypes<typeof viewportActions>;



