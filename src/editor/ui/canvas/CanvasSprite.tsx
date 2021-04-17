import { Rectangle, Vertex } from 'editor/model/geometry';
import { WorldObject } from 'editor/model/object';
import { ObjectSprite } from 'editor/model/sprite';
import { GridService, GridServiceModule } from 'editor/services/GridService';
import {
    editSprite,
    ObjectActions,
    pushSceneToUndoStack,
    selectObject,
    selectSprite,
    SpriteActions,
    UndoActions,
} from 'editor/state/actions';
import produce from 'immer';
import * as React from 'react';

import { Coords, DisplayService, DisplayServiceModule } from '../../services/DisplayService';
import { useDragAndDrop } from '../hooks/dnd';
import { memo } from '../hooks/utils';

export interface CanvasSpriteProps {
    sprite: ObjectSprite;
    parent: WorldObject;
    dispatch: React.Dispatch<SpriteActions | ObjectActions | UndoActions>;
}

export function CanvasSprite(props: CanvasSpriteProps) {

    const [isHover, setHover ] = React.useState(false);

    const displayService = DisplayServiceModule.get();
    const gridService = GridServiceModule.get();
    const width = props.sprite.properties.transform.scaleX;
    const height = props.sprite.properties.transform.scaleY;
    const x = props.sprite.properties.transform.x - width/2;
    const y = props.sprite.properties.transform.y - height / 2;
    const onMouseDown = useDragAndDrop<Vertex>()(dndHandlers(props.parent, props.sprite, props.dispatch, displayService, gridService));

    const mirrorX = width < 0;
    const mirrorY = height < 0;
    const rotationDegrees = props.sprite.properties.transform.rotation * 180 / Math.PI;

    return <g onMouseDown={(evt) => {
        props.dispatch(selectSprite(props.sprite));
        onMouseDown(evt);
    }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <image 
            preserveAspectRatio="none"
            href={props.sprite.properties.src}
            width={Math.abs(width)}
            height={Math.abs(height)}
            transform={`translate(${x}, ${y}) translate(${width/2}, ${height/2}) rotate(${rotationDegrees}) translate(${-width/2}, ${-height/2}) scale(${mirrorX ? -1 : 1}, ${mirrorY ? -1 : 1})`}></image>
        { isHover ? <rect 
            width={Math.abs(width)}
            height={Math.abs(height)}
            transform={`translate(${x}, ${y}) translate(${width/2}, ${height/2}) rotate(${rotationDegrees}) translate(${-width/2}, ${-height/2}) scale(${mirrorX ? -1 : 1}, ${mirrorY ? -1 : 1})`}
            fill={'#fff'} fillOpacity="0.1"></rect> : undefined}
    </g>;
}

const dndHandlers = memo((
    parent: WorldObject,
    model: ObjectSprite,
    dispatch: React.Dispatch<SpriteActions | ObjectActions | UndoActions>,
    displayService: DisplayService,
    gridService: GridService
) => ({
    start: (evt: MouseEvent): Vertex => {
        evt.preventDefault();
        evt.stopPropagation();
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
    
        const snappedRect = gridService.snapRectToGrid(spriteRect);
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
