import { ServicesContext } from "editor/context/ServicesContext";
import { StateContext } from "editor/context/StateContext";
import { ObjectSprite } from "editor/model/sprite";
import { editSprite, pushSceneToUndoStack } from "editor/state/actions";
import produce from "immer";
import * as React from "react";
import { CONTROL_COLOR } from "./colors";
import { ControlRect } from "./ControlRect";

export interface SpriteManipulatorProps {
    sprite: ObjectSprite;
}

export function SpriteManipulator(props: SpriteManipulatorProps) {
    
    const { displayService } = React.useContext(ServicesContext);
    const { state, dispatch } = React.useContext(StateContext);

    const parentTransform = state.scene.objects.find(obj => obj.guid === props.sprite.ownerId)?.properties.transform;
    if (parentTransform == null) {
        throw new Error('Orphan sprite');
    }

    const width = parentTransform.scaleX * props.sprite.properties.transform.scaleX;
    const height = parentTransform.scaleY * props.sprite.properties.transform.scaleY;
    const x = parentTransform.x + props.sprite.properties.transform.x * parentTransform.scaleX - width/2;
    const y = parentTransform.y + props.sprite.properties.transform.y * parentTransform.scaleY - height / 2;

    function startResize(evt: React.MouseEvent) {

        const mappedCoords = displayService.screenCoordsToWorldCoords({ x: evt.clientX, y: evt.clientY });

        const startX = Math.abs(mappedCoords.x - props.sprite.properties.transform.x);
        const startY = Math.abs(mappedCoords.y - props.sprite.properties.transform.y);

        function onUp(evt: MouseEvent) {
            onMove(evt);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('mousemove', onMove);
        }
        
        function onMove(evt: MouseEvent) {
            evt.preventDefault();
            evt.stopPropagation();

            const mappedCoords = displayService.screenCoordsToWorldCoords({ x: evt.clientX, y: evt.clientY });

            dispatch(editSprite(produce(props.sprite, draft => {
                const fX = (Math.abs(mappedCoords.x - props.sprite.properties.transform.x) - startX) * 2;
                const fY = (Math.abs(mappedCoords.y - props.sprite.properties.transform.y) - startY) * 2
                const f = Math.max(fX, fY);
                if (evt.ctrlKey || evt.metaKey) { // Proportional mode
                    draft.properties.transform.scaleX += f;
                    draft.properties.transform.scaleY += f;
                } else if (evt.shiftKey) { // 1D mode
                    if (fX > fY) {
                        draft.properties.transform.scaleX += fX;
                    } else {
                        draft.properties.transform.scaleY += fY;
                    }
                } else {
                    draft.properties.transform.scaleX += fX;
                    draft.properties.transform.scaleY += fY;
                }
            })));
        }

        dispatch(pushSceneToUndoStack());
        window.addEventListener('mouseup', onUp);
        window.addEventListener('mousemove', onMove);
    }

    return <g>
        <rect x={x} y={y} width={width} height={height}
            fill="none" stroke={CONTROL_COLOR} strokeWidth={displayService.zoomIndependentLength(1)}></rect>
        <ControlRect onMouseDown={startResize} direction="nw" x={x} y={y}></ControlRect>
        <ControlRect onMouseDown={startResize} direction="ne" x={x + width} y={y}></ControlRect>
        <ControlRect onMouseDown={startResize} direction="se" x={x + width} y={y + height}></ControlRect>
        <ControlRect onMouseDown={startResize} direction="sw" x={x} y={y + height}></ControlRect>
        {/* <ControlRect direction="n" x={x + width/2} y={y}></ControlRect>
        <ControlRect direction="e" x={x + width} y={y + height/2}></ControlRect>
        <ControlRect direction="s" x={x + width/2} y={y + height}></ControlRect>
        <ControlRect direction="w" x={x} y={y + height / 2}></ControlRect> */}
    </g>;
}
