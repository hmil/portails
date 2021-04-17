import { DragAndDropService, DragAndDropServiceModule } from 'editor/services/DragAndDropService';
import { AppActions } from 'editor/state/reducer';
import { SceneSelection } from 'editor/state/state';
import * as React from 'react';

import { callback, memo } from '../hooks/utils';


export interface AssetSpriteItemProps {
    src: string;
    selection: SceneSelection;
    dispatch: React.Dispatch<AppActions>;
}

export function AssetSpriteItem(props: AssetSpriteItemProps) {
    const dragAndDropService = DragAndDropServiceModule.get();

    const img = makeImage(props.src);

    const onDragStart = dragStartCallback(img, props.src, dragAndDropService);

    return <img className="tile-picker-tile" src={props.src} alt="" onMouseDown={onDragStart}></img>;
}

const dragStartCallback = callback((image: HTMLImageElement, src: string, dragAndDropService: DragAndDropService) => (evt: React.MouseEvent) => {
    evt.preventDefault();
    dragAndDropService.updateGrab({ type: 'sprite', src, clientX: evt.clientX, clientY: evt.clientY, width: image.width, height: image.height });
});

const makeImage = memo((src: string) => {
    const img = new Image();
    img.src = src;
    return img;
});
