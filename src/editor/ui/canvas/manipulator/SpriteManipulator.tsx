import { StateContext } from 'editor/context/StateContext';
import { Transform, Vertex } from 'editor/model/geometry';
import { ObjectSprite } from 'editor/model/sprite';
import { DisplayServiceModule } from 'editor/services/DisplayService';
import { memo } from 'editor/ui/hooks/utils';
import { mat3, vec2 } from 'gl-matrix';
import * as React from 'react';

import { CONTROL_COLOR } from './colors';
import { ResizeControlPoint } from './ResizeControlPoint';
import { RotateControlPoint } from './RotateControlPoint';

export interface SpriteManipulatorProps {
    sprite: ObjectSprite;
}

export interface ResizeData {
    startOffset: Vertex;
    startTransform: Transform;
}

export function SpriteManipulator(props: SpriteManipulatorProps) {
    
    const displayService = DisplayServiceModule.get();
    const { state, dispatch } = React.useContext(StateContext);

    const parentTransform = state.scene.objects.find(obj => obj.guid === props.sprite.ownerId)?.properties.transform;
    if (parentTransform == null) {
        throw new Error('Orphan sprite');
    }

    const width = parentTransform.scaleX * props.sprite.properties.transform.scaleX;
    const height = parentTransform.scaleY * props.sprite.properties.transform.scaleY;
    const x = parentTransform.x + props.sprite.properties.transform.x * parentTransform.scaleX - width/2;
    const y = parentTransform.y + props.sprite.properties.transform.y * parentTransform.scaleY - height / 2;
    const mirrorX = width < 0;
    const mirrorY = height < 0;
    const rotationDegrees = props.sprite.properties.transform.rotation * 180 / Math.PI;

    const strokeWidth = displayService.zoomIndependentLength(1);
    const rotateArmLength = displayService.zoomIndependentLength(20);

    const objTsm = matrixTransform(parentTransform);
    const spriteTsfm = matrixTransform(props.sprite.properties.transform);

    const tsfm = mat3.mul(mat3.create(), objTsm, spriteTsfm);
    const transformString = `matrix(${tsfm[0]}, ${tsfm[1]}, ${tsfm[3]}, ${tsfm[4]}, ${tsfm[6]}, ${tsfm[7]})`;

    return <g>
        <rect width={Math.abs(width)} height={Math.abs(height)}
            transform={`translate(${x}, ${y}) translate(${width/2}, ${height/2}) rotate(${rotationDegrees}) translate(${-width/2}, ${-height/2}) scale(${mirrorX ? -1 : 1}, ${mirrorY ? -1 : 1})`}
            fill="none" stroke={CONTROL_COLOR} strokeWidth={strokeWidth}></rect>
        <ResizeControlPoint transform={tsfm} dispatch={dispatch} sprite={props.sprite} direction="nw" x={-width/2} y={-height/2}></ResizeControlPoint>
        <ResizeControlPoint transform={tsfm} dispatch={dispatch} sprite={props.sprite} direction="ne" x={width/2} y={-height/2}></ResizeControlPoint>
        <ResizeControlPoint transform={tsfm} dispatch={dispatch} sprite={props.sprite} direction="se" x={width/2} y={height/2}></ResizeControlPoint>
        <ResizeControlPoint transform={tsfm} dispatch={dispatch} sprite={props.sprite} direction="sw" x={-width/2} y={height/2}></ResizeControlPoint>
        <ResizeControlPoint transform={tsfm} dispatch={dispatch} sprite={props.sprite} direction="n" x={0} y={-height/2}></ResizeControlPoint>
        <ResizeControlPoint transform={tsfm} dispatch={dispatch} sprite={props.sprite} direction="e" x={width/2} y={0}></ResizeControlPoint>
        <ResizeControlPoint transform={tsfm} dispatch={dispatch} sprite={props.sprite} direction="s" x={0} y={height/2}></ResizeControlPoint>
        <ResizeControlPoint transform={tsfm} dispatch={dispatch} sprite={props.sprite} direction="w" x={-width/2} y={0}></ResizeControlPoint>
        <line transform={transformString} x1={0} y1={-height/2} x2={0} y2={-height/2 - rotateArmLength} stroke={CONTROL_COLOR} strokeWidth={strokeWidth}></line>
        <RotateControlPoint transform={tsfm} dispatch={dispatch} sprite={props.sprite} x={0} y={-height/2 - rotateArmLength}></RotateControlPoint>
    </g>;
}

const matrixTransform = memo((transform: Transform) => {
    const tsfm = mat3.create();
    const tmp = vec2.create();
    mat3.translate(tsfm, tsfm, vec2.set(tmp, transform.x, transform.y));
    // mat3.translate(tsfm, tsfm, vec2.set(tmp, transform.scaleX/2, transform.scaleY/2));
    mat3.rotate(tsfm, tsfm, transform.rotation);
    // mat3.translate(tsfm, tsfm, vec2.set(tmp, -transform.scaleX/2, -transform.scaleY/2));
    mat3.scale(tsfm, tsfm, vec2.set(tmp, transform.scaleX < 0 ? -1 : 1, transform.scaleY < 0 ? -1 : 1));
    return tsfm;
});
