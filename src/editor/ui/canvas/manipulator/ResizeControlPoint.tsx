import { ObjectSprite } from 'editor/model/sprite';
import { DisplayService, DisplayServiceModule } from 'editor/services/DisplayService';
import { GridService, GridServiceModule } from 'editor/services/GridService';
import { editSprite, pushSceneToUndoStack } from 'editor/state/actions';
import { AppActions } from 'editor/state/reducer';
import { DragAndDropHandlers, useDragAndDrop } from 'editor/ui/hooks/dnd';
import { memo } from 'editor/ui/hooks/utils';
import { mat3 } from 'gl-matrix';
import produce from 'immer';
import * as React from 'react';

import { CONTROL_COLOR } from './colors';
import { ResizeData } from './SpriteManipulator';

const size = 10;

export interface ResizeDirection {
    dX: number;
    dY: number;
}

export interface ResizeControlPointProps {
    x: number;
    y: number;
    dispatch: React.Dispatch<AppActions>;
    sprite: ObjectSprite;
    transform: mat3;
    direction: 'n' | 's' | 'e' | 'w' | 'ne' | 'se' | 'sw' | 'nw';
}

export function ResizeControlPoint(props: ResizeControlPointProps) {
    const displayService = DisplayServiceModule.get();
    const scaledSize = displayService.zoomIndependentLength(size);
    const gridService = GridServiceModule.get();
    const direction = parseDirection(props.direction);
    const onMouseDown = useDragAndDrop<ResizeData>()(dndHandlers(props.dispatch, gridService, displayService, props.sprite, direction));
    const cursor = createCursor({
        dX: props.sprite.properties.transform.scaleX < 0 ? -direction.dX : direction.dX,
        dY: props.sprite.properties.transform.scaleY < 0 ? -direction.dY : direction.dY
    });

    return <rect onMouseDown={onMouseDown} stroke='white' strokeWidth={displayService.zoomIndependentLength(1)}
            transform={`matrix(${props.transform[0]}, ${props.transform[1]}, ${props.transform[3]}, ${props.transform[4]}, ${props.transform[6]}, ${props.transform[7]})`}
            cursor={`${cursor}-resize`}
            fill={CONTROL_COLOR}
            x={props.x - scaledSize/2} y={props.y - scaledSize/2} width={scaledSize} height={scaledSize}></rect>
}

function createCursor(direction: ResizeDirection) {
    return (direction.dY < 0 ? 'n' : direction.dY > 0 ? 's' : '') +
            (direction.dX < 0 ? 'w' : direction.dX > 0 ? 'e' : '');
}

const parseDirection = memo((direction: string): ResizeDirection => ({
    dX: direction.includes('e') ? 1 : direction.includes('w') ? -1 : 0,
    dY: direction.includes('n') ? -1 : direction.includes('s') ? 1 : 0,
}));

const dndHandlers = memo((
    dispatch: React.Dispatch<AppActions>,
    gridService: GridService,
    displayService: DisplayService,
    sprite: ObjectSprite,
    direction: ResizeDirection
): DragAndDropHandlers<ResizeData> => ({
    start: (evt: MouseEvent): ResizeData => {
        const mappedCoords = displayService.screenCoordsToWorldCoords({ x: evt.clientX, y: evt.clientY });
        dispatch(pushSceneToUndoStack());
        return {
            startOffset: mappedCoords,
            startTransform: sprite.properties.transform
        };
    },
    dragging: (evt: MouseEvent, resizeData: ResizeData) => {
        evt.preventDefault();
        evt.stopPropagation();

        const mappedCoords = gridService.snapVertexToGrid(displayService.screenCoordsToWorldCoords({ x: evt.clientX, y: evt.clientY }));

        dispatch(editSprite(produce(sprite, draft => {
            const dX = mappedCoords.x - resizeData.startOffset.x;
            const dY = mappedCoords.y - resizeData.startOffset.y;

            if (evt.ctrlKey || evt.metaKey) { // Proportional mode
                const ar = draft.properties.transform.scaleY / draft.properties.transform.scaleX;
                const ddX = direction.dX > 0 ? dX : -dX;
                const ddY = direction.dY > 0 ? dY : -dY;

                if (ddX > ddY) {
                    draft.properties.transform.scaleX = resizeData.startTransform.scaleX + ddX;
                    draft.properties.transform.x = resizeData.startTransform.x + ddX * direction.dX / 2 * Math.abs(direction.dX);
                    draft.properties.transform.scaleY = (resizeData.startTransform.scaleX + ddX) * ar;
                    draft.properties.transform.y = resizeData.startTransform.y + (resizeData.startTransform.scaleY - (resizeData.startTransform.scaleX + ddX) * ar) / 2 * -direction.dY;
                } else {
                    draft.properties.transform.scaleY = resizeData.startTransform.scaleY + ddY;
                    draft.properties.transform.y = resizeData.startTransform.y + ddY * direction.dY / 2 * Math.abs(direction.dY);
                    draft.properties.transform.scaleX = (resizeData.startTransform.scaleY + ddY) / ar;
                    draft.properties.transform.x = resizeData.startTransform.x + (resizeData.startTransform.scaleX - (resizeData.startTransform.scaleY + ddY) / ar) / 2 * -direction.dX;
                }
            } else {
                draft.properties.transform.scaleX = resizeData.startTransform.scaleX + dX * direction.dX;
                draft.properties.transform.x = resizeData.startTransform.x + dX / 2 * Math.abs(direction.dX);
                draft.properties.transform.scaleY = resizeData.startTransform.scaleY + dY * direction.dY;
                draft.properties.transform.y = resizeData.startTransform.y + dY / 2 * Math.abs(direction.dY);
            }
        })));
        return resizeData;
    }
}));
