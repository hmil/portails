import { ServicesContext } from "editor/context/ServicesContext";
import { ChainGeometry, Vertex } from "editor/model/geometry";
import { editChain, GeometryActions, pushSceneToUndoStack, UndoActions } from "editor/state/actions";
import { useDragAndDrop } from "editor/ui/hooks/dnd";
import { arrayReplace } from "editor/utils/arrays";
import * as React from "react";
import { CONTROL_COLOR } from "./colors";

export interface ChainVertexManipulatorProps {
    vertexIndex: number;
    dispatch: React.Dispatch<UndoActions | GeometryActions>;
    chain: ChainGeometry;
}

export function ChainVertexManipulator(props: ChainVertexManipulatorProps) {
    const vert = props.chain.vertices[props.vertexIndex];
    const { displayService, gridService } = React.useContext(ServicesContext);

    const vertexHalfWidth = displayService.zoomIndependentLength(5);
    const lineWidth = displayService.zoomIndependentLength(1);
    const strokeColor = CONTROL_COLOR;

    const startDragging = useDragAndDrop({
        start: (evt: React.MouseEvent) => {
            const startPos = displayService.screenCoordsToWorldCoords({x: evt.clientX, y: evt.clientY});
            props.dispatch(pushSceneToUndoStack());
            return {
                x: startPos.x - vert.x,
                y: startPos.y - vert.y
            };
        },
        dragging: (evt: MouseEvent, startOffset: Vertex) => {
            const newPos = displayService.screenCoordsToWorldCoords({x: evt.clientX, y: evt.clientY});
            newPos.x -= startOffset.x;
            newPos.y -= startOffset.y;

            const snapped = gridService.snapToGrid({ left: newPos.x, right: newPos.x, top: newPos.y, bottom: newPos.y });

            props.dispatch(editChain({ ownerId: props.chain.ownerId, chainId: props.chain.geometryId, vertices: 
                arrayReplace(props.chain.vertices, props.vertexIndex, { x: snapped.left, y: snapped.top })
            }));

            return startOffset;
        }
    });

    return <rect
        x={vert.x - vertexHalfWidth}
        y={vert.y - vertexHalfWidth}
        width={vertexHalfWidth*2}
        height={vertexHalfWidth*2}
        fill={strokeColor}
        stroke='white'
        strokeWidth={lineWidth}
        onMouseDown={startDragging}
        />
}