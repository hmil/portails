import { ServicesContext } from 'editor/context/ServicesContext';
import { Transform } from 'editor/model/geometry';
import { WorldObject } from 'editor/model/object';
import { ObjectSprite } from 'editor/model/sprite';
import { editSprite, ObjectActions, selectObject, selectSprite, SpriteActions } from 'editor/state/actions';
import produce from 'immer';
import * as React from 'react';

import { callback } from '../hooks/utils';
import { DisplayService } from '../services/DisplayService';

export interface CanvasSpriteProps {
    sprite: ObjectSprite;
    parent: WorldObject;
    parentTransform: Transform;
    dispatch: React.Dispatch<SpriteActions | ObjectActions>;
}

export function CanvasSprite(props: CanvasSpriteProps) {

    const [isHover, setHover ] = React.useState(false);

    const { displayService } = React.useContext(ServicesContext);
    const width = props.parentTransform.scaleX * props.sprite.properties.transform.scaleX;
    const height = props.parentTransform.scaleY * props.sprite.properties.transform.scaleY;
    const x = props.parentTransform.x + props.sprite.properties.transform.x * props.parentTransform.scaleX - width/2;
    const y = props.parentTransform.y + props.sprite.properties.transform.y * props.parentTransform.scaleY - height / 2;
    const onMouseDown = mouseDownCallback(props.parent, props.sprite, props.dispatch, displayService);
    return <g onMouseDown={onMouseDown} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <image 
            preserveAspectRatio="none"
            href={props.sprite.properties.src}
            width={width}
            height={height}
            x={x}
            y={y}></image>
        { isHover ? <rect width={width}
            height={height}
            x={x}
            y={y}
            fill={'#f00'} fillOpacity="0.5"></rect> : undefined}
    </g>;
}

const mouseDownCallback = callback((parent: WorldObject, model: ObjectSprite, dispatch: React.Dispatch<SpriteActions | ObjectActions>, displayService: DisplayService) => (evt: React.MouseEvent) => {
    // if (!parent.selected) {
    //     return;
    // }
    dispatch(selectObject(parent));
    evt.preventDefault();
    evt.stopPropagation();
    const startPos = displayService.screenCoordsToWorldCoords({x: evt.clientX, y: evt.clientY});
    const startOffset = {
        x: startPos.x - model.properties.transform.x,
        y: startPos.y - model.properties.transform.y
    };
    function onRelease(evt: MouseEvent) {
        onMove(evt);
        window.removeEventListener('mouseup', onRelease);
        window.removeEventListener('mousemove', onMove);
    }
    function onMove(evt: MouseEvent) {
        const newPos = displayService.screenCoordsToWorldCoords({x: evt.clientX, y: evt.clientY});
        newPos.x -= startOffset.x;
        newPos.y -= startOffset.y;

        dispatch(editSprite(produce(model, draft => {
            draft.properties.transform.x = newPos.x;
            draft.properties.transform.y = newPos.y;
        })));
    }
    window.addEventListener('mouseup', onRelease);
    window.addEventListener('mousemove', onMove);
    dispatch(selectSprite(model));
});