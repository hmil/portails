import { StateContext } from 'editor/context/StateContext';
import { ObjectSprite } from 'editor/model/sprite';
import { createSprite, pushSceneToUndoStack } from 'editor/state/actions';
import { AppActions } from 'editor/state/reducer';
import { uniqId } from 'editor/utils/uid';
import * as React from 'react';

import { Button } from './components/Button';
import { List } from './components/List';
import { useFresh } from './hooks/useFresh';
import { callback } from './hooks/utils';
import { Panel } from './Panel';
import { SpriteListItem } from './SpriteListItem';

export function SpritesPanel() {
    const { dispatch, state } = React.useContext(StateContext);

    const [ freshSprite, setFreshSprite ] = useFresh();

    const selectedObject = state.scene.objects.find(o => o.guid === state.scene.selectedObjectId);
    const renderListItem = renderItemCallback(dispatch, freshSprite);

    return <Panel title="Sprites">
        <div className="properties-panel">
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
                </div>
            </> }
        </div>
    </Panel>;
}

const renderItemCallback = callback((dispatch: React.Dispatch<AppActions>, freshSprite: string | null) => (sprite: ObjectSprite) =>
    <SpriteListItem fresh={freshSprite === sprite.spriteId} dispatch={dispatch} sprite={sprite} key={sprite.spriteId}></SpriteListItem>);
