import { GrabbedThing } from "editor/state/state";
import * as React from "react";
import { memo } from "./hooks/utils";


interface GrabOverlayProps {
    grabbedThing: GrabbedThing;
}

export function GrabOverlay(props: GrabOverlayProps) {
    return <img className="drag-image" src={props.grabbedThing.src} style={computeDragImageStyle(props.grabbedThing)} />;
}


const computeDragImageStyle = memo((grabbedThing: GrabbedThing): React.CSSProperties => ({
    left: (grabbedThing.clientX - 20) + 'px',
    top: (grabbedThing.clientY - 20) + 'px',
    width: '40px',
    height: '40px'
}));
