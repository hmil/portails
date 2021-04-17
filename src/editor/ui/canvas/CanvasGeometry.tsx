import { ObjectGeometry } from 'editor/model/geometry';
import { WorldObject } from 'editor/model/object';
import { DisplayServiceModule } from 'editor/services/DisplayService';
import { GeometryActions, selectGeometry, UndoActions } from 'editor/state/actions';
import { SceneSelection } from 'editor/state/state';
import * as React from 'react';

export interface CanvasGeometryProps {
    geometry: ObjectGeometry;
    parent: WorldObject;
    selection: SceneSelection;
    dispatch: React.Dispatch<GeometryActions | UndoActions>;
}

export function CanvasGeometry(props: CanvasGeometryProps) {

    const [ isHover, setHover ] = React.useState(false);
    const displayService = DisplayServiceModule.get();

    const lineWidth = displayService.zoomIndependentLength((isHover || isSelected(props.geometry, props.selection)) ? 3 : 1);
    const clickWidth = displayService.zoomIndependentLength(10);

    const vertices = props.geometry.vertices.map(vert => ({
        x: vert.x,
        y: vert.y
    }));
    const strokeColor = '#e63904';

    return <g onClick={() => {
        props.dispatch(selectGeometry({ ownerId: props.geometry.ownerId, geometryId: props.geometry.geometryId }));
    }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        {
            vertices.map((v1, i) => {
                if (vertices.length === i + 1) {
                    return;
                }
                const v2 = vertices[i+1];
                return <g key={i}>
                    <line x1={v1.x} y1={v1.y} x2={v2.x} y2={v2.y} stroke={strokeColor} strokeWidth={lineWidth} />
                    <line x1={v1.x} y1={v1.y} x2={v2.x} y2={v2.y} stroke="transparent" strokeWidth={clickWidth} />
                </g>;
            })
        }
    </g>;
}

function isSelected(geometry: ObjectGeometry, selection: SceneSelection) {
    return selection?.type === 'geometry' && selection.geometryId === geometry.geometryId;
}