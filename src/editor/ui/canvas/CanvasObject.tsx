import { WorldObject } from 'editor/model/object';
import { ObjectActions, SpriteActions, UndoActions } from 'editor/state/actions';
import * as React from 'react';

import { CanvasSprite } from './CanvasSprite';

export interface CanvasObjectProps {
    model: WorldObject;
    dispatch: React.Dispatch<ObjectActions | SpriteActions| UndoActions>;
}

export function CanvasObject(props: CanvasObjectProps) {
    return <g>
        <title>{props.model.properties.name}</title>
        
        { props.model.sprites.map(sprite => <CanvasSprite
                sprite={sprite}
                parent={props.model}
                parentTransform={props.model.properties.transform}
                key={sprite.spriteId}
                dispatch={props.dispatch}
            ></CanvasSprite>)
        }
    </g>;
}
