import { ServicesContext } from 'editor/context/ServicesContext';
import { Rectangle, Transform, Vertex } from 'editor/model/geometry';
import { WorldObject } from 'editor/model/object';
import { ObjectSprite } from 'editor/model/sprite';
import { editSprite, ObjectActions, pushSceneToUndoStack, selectObject, selectSprite, SpriteActions, UndoActions } from 'editor/state/actions';
import produce from 'immer';
import * as React from 'react';

import { callback, memo } from '../hooks/utils';
import { Coords, DisplayService } from '../../services/DisplayService';
import { GridService } from 'editor/services/GridService';
import { useDragAndDrop } from '../hooks/dnd';

export interface CanvasSpriteProps {
    sprite: ObjectSprite;
    parent: WorldObject;
    dispatch: React.Dispatch<SpriteActions | ObjectActions | UndoActions>;
}

export function CanvasSprite(props: CanvasSpriteProps) {

    const [isHover, setHover ] = React.useState(false);

    const { displayService, gridService } = React.useContext(ServicesContext);
    const width = props.sprite.properties.transform.scaleX;
    const height = props.sprite.properties.transform.scaleY;
    const x = props.sprite.properties.transform.x - width/2;
    const y = props.sprite.properties.transform.y - height / 2;
    const onMouseDown = useDragAndDrop(dndHandlers(props.parent, props.sprite, props.dispatch, displayService, gridService));
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
            fill={'#f00'} fillOpacity="0.2"></rect> : undefined}
    </g>;
}

const dndHandlers = memo((
    parent: WorldObject,
    model: ObjectSprite,
    dispatch: React.Dispatch<SpriteActions | ObjectActions | UndoActions>,
    displayService: DisplayService,
    gridService: GridService
) => ({
    start: (evt: React.MouseEvent): Vertex => {
        dispatch(selectObject(parent));
        evt.preventDefault();
        evt.stopPropagation();
        dispatch(selectSprite(model));
        dispatch(pushSceneToUndoStack());
        const startPos = displayService.screenCoordsToWorldCoords({x: evt.clientX, y: evt.clientY});
        return {
            x: startPos.x - model.properties.transform.x,
            y: startPos.y - model.properties.transform.y
        };
    },
    dragging: (evt: MouseEvent, startOffset: Vertex) => {
        const newPos = displayService.screenCoordsToWorldCoords({x: evt.clientX, y: evt.clientY});
        newPos.x -= startOffset.x;
        newPos.y -= startOffset.y;
    
        const spriteRect: Rectangle = {
            bottom: newPos.y + model.properties.transform.scaleY/2,
            top: newPos.y - model.properties.transform.scaleY/2,
            left: newPos.x - model.properties.transform.scaleX/2,
            right: newPos.x + model.properties.transform.scaleX/2,
        }
    
        const snappedRect = gridService.snapToGrid(spriteRect);
        const fixedCoords: Coords = {
            x: snappedRect.left + (snappedRect.right - snappedRect.left) / 2,
            y: snappedRect.top + (snappedRect.bottom - snappedRect.top) / 2,
        }
    
        dispatch(editSprite(produce(model, draft => {
            draft.properties.transform.x = fixedCoords.x;
            draft.properties.transform.y = fixedCoords.y;
        })));
        return startOffset;
    }
}));
