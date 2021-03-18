import { ServicesContext } from "editor/context/ServicesContext";
import * as React from "react";
import { CONTROL_COLOR } from "./colors";

const size = 10;

export interface ControlRectProps {
    x: number;
    y: number;
    direction: 'n' | 's' | 'e' | 'w' | 'ne' | 'se' | 'sw' | 'nw';
    onMouseDown?: (evt: React.MouseEvent) => void;
}

export function ControlRect(props: ControlRectProps) {
    const { displayService } = React.useContext(ServicesContext);

    const scaledSize = displayService.zoomIndependentLength(size);

    return <rect onMouseDown={props.onMouseDown} stroke='white' strokeWidth={displayService.zoomIndependentLength(1)}
    cursor={`${props.direction}-resize`}
            fill={CONTROL_COLOR}
            x={props.x - scaledSize/2} y={props.y - scaledSize/2} width={scaledSize} height={scaledSize}></rect>
}
