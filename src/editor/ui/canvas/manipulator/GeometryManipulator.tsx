import { ServicesContext } from 'editor/context/ServicesContext';
import { StateContext } from 'editor/context/StateContext';
import { ObjectGeometry } from 'editor/model/geometry';
import { GeometryActions, UndoActions } from 'editor/state/actions';
import * as React from 'react';

import { ChainVertexManipulator } from './ChainVertexManipulator';
import { CONTROL_COLOR } from './colors';

export interface GeometryManipulatorProps {
    geometry: ObjectGeometry;
    dispatch: React.Dispatch<GeometryActions | UndoActions>;
}

export function GeometryManipulator(props: GeometryManipulatorProps) {
    
    const { state } = React.useContext(StateContext);
    const { displayService } = React.useContext(ServicesContext);
    
    const strokeWidth = displayService.zoomIndependentLength(1);

    const transform = state.scene.objects.find(obj => obj.guid === props.geometry.ownerId)?.properties.transform;
    if (transform == null) {
        throw new Error('Orphan geometry');
    }
    const vertices = props.geometry.vertices.map(vert => ({
        x: vert.x,
        y: vert.y
    }));

    return <g transform={`scale(${transform.scaleY} ${transform.scaleY}) translate(${transform.x} ${transform.y})`}>
        { vertices.map((vertex, i) => [
            <ChainVertexManipulator key={`${i}-v`} chain={props.geometry} vertexIndex={i} dispatch={props.dispatch} ></ChainVertexManipulator>,
            i != 0 ? <line key={`${i}-l`} x1={vertices[i - 1].x} y1={vertices[i - 1].y} x2={vertex.x} y2={vertex.y} strokeWidth={strokeWidth} stroke={CONTROL_COLOR} /> : undefined
        ])  }
    </g>;
}
