import { ServicesContext } from "editor/context/ServicesContext";
import { WorldObject } from "editor/model/object";
import { ObjectActions, editObject, selectObject } from "editor/state/actions";
import { callback } from "editor/ui/hooks/utils";
import { DisplayService } from "editor/ui/services/DisplayService";
import produce from "immer";
import * as React from "react";

const crossSize = 12;
const margin = 14;

export interface ObjectManipulatorProps {
    model: WorldObject;
    dispatch: React.Dispatch<ObjectActions>;
}

export function ObjectManipulator(props: ObjectManipulatorProps) {

    const { displayService } = React.useContext(ServicesContext);

    const [isHover, setHover ] = React.useState(false);

    const boundingBox = props.model.boundingBox;
    const transform = props.model.properties.transform;
    const drawingColor = isHover ? '#fa4343' : props.model.selected ? '#09ff00' : '#fff';
    const crossScreenSize = displayService.zoomIndependentLength(crossSize);
    const lineWidth = displayService.zoomIndependentLength(1);
    const boundingMargin = displayService.zoomIndependentLength(margin);
    const onMouseDown = mouseDownCallback(props.model, props.dispatch, displayService);
    return <g onMouseDown={onMouseDown} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <rect 
            width={boundingBox.right - boundingBox.left + boundingMargin * 2}
            height={boundingBox.bottom - boundingBox.top + boundingMargin * 2}
            x={boundingBox.left + transform.x - boundingMargin}
            y={boundingBox.top + transform.y - boundingMargin}
            strokeWidth={lineWidth}
            fillOpacity="0"
            fill="none"
            stroke={drawingColor}></rect>
        <line x1={transform.x - crossScreenSize} y1={transform.y} x2={transform.x + crossScreenSize} y2={transform.y} stroke={drawingColor} strokeWidth={lineWidth}></line>
        <line x1={transform.x} y1={transform.y - crossScreenSize} x2={transform.x} y2={transform.y + crossScreenSize} stroke={drawingColor} strokeWidth={lineWidth}></line>
        <circle cx={transform.x} cy={transform.y} r={crossScreenSize / 2} fill="transparent"></circle>
    </g>
}

const mouseDownCallback = callback((model: WorldObject, dispatch: React.Dispatch<ObjectActions>, displayService: DisplayService) => (evt: React.MouseEvent) => {
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

        dispatch(editObject(produce(model, draft => {
            draft.properties.transform.x = newPos.x;
            draft.properties.transform.y = newPos.y;
        })));
    }
    window.addEventListener('mouseup', onRelease);
    window.addEventListener('mousemove', onMove);
    dispatch(selectObject(model));
});