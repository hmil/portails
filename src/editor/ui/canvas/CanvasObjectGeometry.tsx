import { WorldObject } from "editor/model/object";
import { ObjectActions, SpriteActions, GeometryActions, UndoActions, selectGeometry } from "editor/state/actions";
import { SceneSelection } from "editor/state/state";
import * as React from "react";
import { CanvasGeometry } from "./CanvasGeometry";

export interface CanvasObjectProps {
    model: WorldObject;
    selection: SceneSelection;
    dispatch: React.Dispatch<ObjectActions | SpriteActions | GeometryActions | UndoActions>;
}

export function CanvasObjectGeometry(props: CanvasObjectProps) {
    const transform = props.model.properties.transform;
    return <g transform={`scale(${transform.scaleY} ${transform.scaleY}) translate(${transform.x} ${transform.y})`}>
        <title>{props.model.properties.name}</title>

        { props.model.geometries.map(geometry => <CanvasGeometry
                key={geometry.geometryId}
                selection={props.selection}
                geometry={geometry}
                parent={props.model}
                dispatch={props.dispatch}
            ></CanvasGeometry>)
        }
    </g>;
}