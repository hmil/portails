import { Vertex } from 'editor/model/geometry';
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

interface RotateControlPointProps {
    dispatch: React.Dispatch<AppActions>;
    sprite: ObjectSprite;
    x: number;
    y: number;
    transform: mat3;
}

const size = 5;

export function RotateControlPoint(props: RotateControlPointProps) {

    const displayService = DisplayServiceModule.get();
    const scaledR = displayService.zoomIndependentLength(size);

    const onMouseDown = useDragAndDrop<ResizeData>()(dndHandlers(props.dispatch, displayService, props.sprite));

    return <circle onMouseDown={onMouseDown} stroke='white' strokeWidth={displayService.zoomIndependentLength(1)}
            transform={`matrix(${props.transform[0]}, ${props.transform[1]}, ${props.transform[3]}, ${props.transform[4]}, ${props.transform[6]}, ${props.transform[7]})`}
            cursor="grab"
            fill={CONTROL_COLOR}
            cx={props.x} cy={props.y} r={scaledR}></circle>
}

const dndHandlers = memo((
    dispatch: React.Dispatch<AppActions>,
    displayService: DisplayService,
    sprite: ObjectSprite,
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

        const mappedCoords = displayService.screenCoordsToWorldCoords({ x: evt.clientX, y: evt.clientY });

        const startAngle = Math.atan2(resizeData.startOffset.y - resizeData.startTransform.y, resizeData.startOffset.x - resizeData.startTransform.x);
        const endAngle = Math.atan2(mappedCoords.y - resizeData.startTransform.y, mappedCoords.x - resizeData.startTransform.x);

        dispatch(editSprite(produce(sprite, draft => {
            const dX = mappedCoords.x - resizeData.startOffset.x;
            const dY = mappedCoords.y - resizeData.startOffset.y;
            
            draft.properties.transform.rotation = resizeData.startTransform.rotation + endAngle - startAngle;
            // if (evt.ctrlKey || evt.metaKey) { // Proportional mode
            //     const ar = draft.properties.transform.scaleY / draft.properties.transform.scaleX;
            //     const ddX = direction.dX > 0 ? dX : -dX;
            //     const ddY = direction.dY > 0 ? dY : -dY;

            //     if (ddX > ddY) {
            //         draft.properties.transform.scaleX = resizeData.startTransform.scaleX + ddX;
            //         draft.properties.transform.x = resizeData.startTransform.x + ddX * direction.dX / 2 * Math.abs(direction.dX);
            //         draft.properties.transform.scaleY = (resizeData.startTransform.scaleX + ddX) * ar;
            //         draft.properties.transform.y = resizeData.startTransform.y + (resizeData.startTransform.scaleY - (resizeData.startTransform.scaleX + ddX) * ar) / 2 * -direction.dY;
            //     } else {
            //         draft.properties.transform.scaleY = resizeData.startTransform.scaleY + ddY;
            //         draft.properties.transform.y = resizeData.startTransform.y + ddY * direction.dY / 2 * Math.abs(direction.dY);
            //         draft.properties.transform.scaleX = (resizeData.startTransform.scaleY + ddY) / ar;
            //         draft.properties.transform.x = resizeData.startTransform.x + (resizeData.startTransform.scaleX - (resizeData.startTransform.scaleY + ddY) / ar) / 2 * -direction.dX;
            //     }
            // } else {
            //     draft.properties.transform.scaleX = resizeData.startTransform.scaleX + dX * direction.dX;
            //     draft.properties.transform.x = resizeData.startTransform.x + dX / 2 * Math.abs(direction.dX);
            //     draft.properties.transform.scaleY = resizeData.startTransform.scaleY + dY * direction.dY;
            //     draft.properties.transform.y = resizeData.startTransform.y + dY / 2 * Math.abs(direction.dY);
            // }
        })));
        return resizeData;
    }
}));
