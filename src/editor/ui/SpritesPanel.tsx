import { StateContext } from 'editor/context/StateContext';
import { ObjectSprite } from 'editor/model/sprite';
import { createSprite, pushSceneToUndoStack, removeSelectedSprite } from 'editor/state/actions';
import { AppActions } from 'editor/state/reducer';
import { getSelectedObject } from 'editor/state/selectors';
import { SceneSelection } from 'editor/state/state';
import { uniqId } from 'editor/utils/uid';
import * as React from 'react';

import { Button } from './components/Button';
import { List } from './components/List';
import { useFresh } from './hooks/useFresh';
import { callback } from './hooks/utils';
import { SpriteListItem } from './SpriteListItem';

export function SpritesPanel() {
    const { dispatch, state } = React.useContext(StateContext);

    const [ freshSprite, setFreshSprite ] = useFresh();

    const selectedObject = getSelectedObject(state);
    const renderListItem = renderItemCallback(dispatch, state.scene.selection, freshSprite);

    return <div className="properties-panel">
        { selectedObject == null ? 'Select an object to see its sprites.' : <>
            <div className="list-container">
                <List renderItem={renderListItem} data={selectedObject.sprites}></List>
            </div>
            <div className="actions-container">
                <Button onClick={() => {
                    const guid = String(uniqId());
                    setFreshSprite(guid);
                    dispatch(pushSceneToUndoStack());
                    dispatch(createSprite({
                        ownerId: selectedObject?.guid,
                        spriteId: guid
                    }));
                }} value="+" tooltip="Add sprite"></Button>
                <Button disabled={state.scene.selection?.type !== 'sprite'} onClick={() => {
                    dispatch(pushSceneToUndoStack());
                    dispatch(removeSelectedSprite());
                }} value="-" tooltip="Remove sprite"></Button>
            </div>
        </> }
    </div>;
}

const renderItemCallback = callback((dispatch: React.Dispatch<AppActions>, selection: SceneSelection, freshSprite: string | null) => (sprite: ObjectSprite) =>
    <SpriteListItem selected={selection?.type === 'sprite' && selection.spriteId === sprite.spriteId} fresh={freshSprite === sprite.spriteId} dispatch={dispatch} sprite={sprite} key={sprite.spriteId}></SpriteListItem>);
