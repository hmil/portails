import { ServicesContext } from 'editor/context/ServicesContext';
import { StateContext } from 'editor/context/StateContext';
import { Viewport } from 'editor/model/viewport';
import { scrollViewport, zoomViewport } from 'editor/state/actions';
import { getCurrentGeometry, getSelectedSprite } from 'editor/state/selectors';
import * as React from 'react';

import { DisplayCanvasRect } from '../../services/DisplayService';
import { memo } from '../hooks/utils';
import { CanvasObjectGeometry } from './CanvasObjectGeometry';
import { CanvasObjectSprite } from './CanvasObjectSprite';
import { GeometryManipulator } from './manipulator/GeometryManipulator';
import { ObjectManipulator } from './manipulator/ObjectManipulator';
import { SpriteManipulator } from './manipulator/SpriteManipulator';

export function Canvas() {
    const { displayService } = React.useContext(ServicesContext);
    const { state, dispatch } = React.useContext(StateContext);
    const canvasEl = React.useRef<HTMLDivElement>(null);

    const boundingRect = canvasEl.current?.getBoundingClientRect();
    const viewBox = computeViewBox(state.viewport, boundingRect);
    displayService.sync(state.viewport, computeCanvasRect(boundingRect?.x ?? 0, boundingRect?.y ?? 0, boundingRect?.width ?? 0, boundingRect?.height ?? 0))

    const [resizeCounter, setResizeCounter] = React.useState(0);

    const currentSprite = getSelectedSprite(state);
    const currentGeometry = getCurrentGeometry(state);

    React.useEffect(() => {
        let counter = 0;
        function listener() {
            setResizeCounter(counter++);
        }
        window.addEventListener('resize', listener);

        return () => {
            window.removeEventListener('resize', listener);
        };
    }, []);

    React.useEffect(() => {
        setResizeCounter(resizeCounter - 1);
        function onWheel(evt: WheelEvent) {
            if (evt.shiftKey) {
                dispatch(scrollViewport({
                    deltaX: evt.deltaY,
                    deltaY: evt.deltaX
                })); 
            } else if (evt.ctrlKey || evt.metaKey) {
                dispatch(zoomViewport({ delta: -evt.deltaY })); 
            } else {
                dispatch(scrollViewport(evt)); 
            }
        }
        canvasEl.current?.addEventListener('wheel', onWheel);
    }, [canvasEl.current, dispatch]);

    return (
        <div ref={canvasEl} className="canvas">
            <svg viewBox={viewBox} className="canvas-svg">
                { state.scene.objects.map(object => <CanvasObjectSprite model={object} dispatch={dispatch} key={object.guid}></CanvasObjectSprite>) }
                { state.scene.objects.map(object => <CanvasObjectGeometry selection={state.scene.selection} model={object} dispatch={dispatch} key={object.guid}></CanvasObjectGeometry>) }
                { state.scene.objects.map(object => <ObjectManipulator model={object} dispatch={dispatch} selection={state.scene.selection} key={object.guid}></ObjectManipulator>) }
                { currentSprite != null ? <SpriteManipulator sprite={currentSprite}></SpriteManipulator> : undefined }
                { currentGeometry != null ? <GeometryManipulator geometry={currentGeometry} dispatch={dispatch}></GeometryManipulator> : undefined }
            </svg>
        </div>
    );
}

const computeViewBox = memo((viewport: Viewport, canvasSize: DOMRect | undefined) => {
    if (canvasSize == null) {
        return `0 0 800 600`;
    }
    const width = canvasSize.width / viewport.zoomFactor;
    const height = canvasSize.height / viewport.zoomFactor;
    const minX = viewport.centerX - width / 2;
    const minY = viewport.centerY - height / 2;
    return `${minX} ${minY} ${width} ${height}`
});

const computeCanvasRect = memo((x: number, y: number, width: number, height: number): DisplayCanvasRect => ({
    x, y, width, height
}));
