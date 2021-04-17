import { StateContext } from 'editor/context/StateContext';
import { Viewport } from 'editor/model/viewport';
import { DragAndDropServiceModule } from 'editor/services/DragAndDropService';
import { scrollViewport, setCanvasRect, zoomViewport } from 'editor/state/actions';
import { getCurrentGeometry, getSelectedSprite } from 'editor/state/selectors';
import * as React from 'react';

import { DisplayCanvasRect } from '../../services/DisplayService';
import { memo } from '../hooks/utils';
import { CanvasObjectGeometry } from './CanvasObjectGeometry';
import { CanvasObjectSprite } from './CanvasObjectSprite';
import { GeometryManipulator } from './manipulator/GeometryManipulator';
import { ObjectManipulator } from './manipulator/ObjectManipulator';
import { SpriteManipulator } from './manipulator/SpriteManipulator';

interface DraggedSprite {
    worldX: number;
    worldY: number;
    src: string;
}

export function Canvas() {
    const { state, dispatch } = React.useContext(StateContext);
    const canvasEl = React.useRef<HTMLDivElement>(null);

    const boundingRect = canvasEl.current?.getBoundingClientRect();
    const viewBox = computeViewBox(state.viewport, boundingRect);
    const canvasRect = computeCanvasRect(boundingRect?.x ?? 0, boundingRect?.y ?? 0, boundingRect?.width ?? 0, boundingRect?.height ?? 0);
    React.useEffect(() => {
        dispatch(setCanvasRect({canvasRect}));
    }, [canvasRect]);

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

    const dragAndDropService = DragAndDropServiceModule.get();
    const draggedSprite = dragAndDropService.getPendingDropItem();

    return (
        <div ref={canvasEl} className="canvas">
            <svg viewBox={viewBox} className="canvas-svg">
                { state.scene.objects.map(object => <CanvasObjectSprite background={true} model={object} dispatch={dispatch} key={object.guid}></CanvasObjectSprite>) }
                { state.scene.objects.map(object => <CanvasObjectSprite background={false} model={object} dispatch={dispatch} key={object.guid}></CanvasObjectSprite>) }
                { state.scene.objects.map(object => <CanvasObjectGeometry selection={state.scene.selection} model={object} dispatch={dispatch} key={object.guid}></CanvasObjectGeometry>) }
                { state.scene.objects.map(object => <ObjectManipulator model={object} dispatch={dispatch} selection={state.scene.selection} key={object.guid}></ObjectManipulator>) }
                { currentSprite != null ? <SpriteManipulator sprite={currentSprite}></SpriteManipulator> : undefined }
                { currentGeometry != null ? <GeometryManipulator geometry={currentGeometry} dispatch={dispatch}></GeometryManipulator> : undefined }
                { draggedSprite != null ? <image 
                    preserveAspectRatio="none"
                    href={draggedSprite.src}
                    width={draggedSprite.width}
                    height={draggedSprite.height}
                    x={draggedSprite.worldX - draggedSprite.width / 2}
                    y={draggedSprite.worldY - draggedSprite.height / 2}></image> : undefined}
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
