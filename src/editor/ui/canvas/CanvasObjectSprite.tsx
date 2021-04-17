import { WorldObject } from 'editor/model/object';
import { GeometryActions, ObjectActions, SpriteActions, UndoActions } from 'editor/state/actions';
import * as React from 'react';

import { CanvasSprite } from './CanvasSprite';

export interface CanvasObjectProps {
    model: WorldObject;
    background: boolean;
    dispatch: React.Dispatch<ObjectActions | SpriteActions | GeometryActions | UndoActions>;
}

export const CanvasObjectSprite = React.memo(function _CanvasObjectSprite(props: CanvasObjectProps) {
    const transform = props.model.properties.transform;
    return <g transform={`scale(${transform.scaleY} ${transform.scaleY}) translate(${transform.x} ${transform.y})`}>
        <title>{props.model.properties.name}</title>

        { props.model.sprites
            .filter(sprite => sprite.properties.background === props.background)
            .map(sprite => <CanvasSprite
                sprite={sprite}
                parent={props.model}
                key={sprite.spriteId}
                dispatch={props.dispatch}
            ></CanvasSprite>)
        }
    </g>;
});
