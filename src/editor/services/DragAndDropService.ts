import {
    createObject,
    createSprite,
    editSprite,
    grabSprite,
    pushSceneToUndoStack,
    stopGrabbing,
} from 'editor/state/actions';
import { AppActions } from 'editor/state/reducer';
import { GrabbedThing, SceneState } from 'editor/state/state';
import { uniqId } from 'editor/utils/uid';
import * as React from 'react';

import { DisplayService } from './DisplayService';
import { GridService } from './GridService';
import { createServiceModule } from './injector';

export interface DropSprite {
    worldX: number;
    worldY: number;
    width: number;
    height: number;
    src: string;
}


export class DragAndDropService {

    constructor(
        private readonly displayService: DisplayService,
        private readonly gridService: GridService,
        private readonly grabbedThing: GrabbedThing | null,
        private readonly scene: SceneState,
        private readonly dispatch: React.Dispatch<AppActions>) {}

    updateGrab(thing: GrabbedThing) {
        this.dispatch(grabSprite(thing))
    }

    getPendingDropItem(): DropSprite | null {
        if (this.grabbedThing == null) {
            return null;
        }
        const coords = this.displayService.screenCoordsToWorldCoords({
            x: this.grabbedThing.clientX, y: this.grabbedThing.clientY
        });
        const snapped = this.gridService.snapRectToGrid({
            left: coords.x - this.grabbedThing.width / 2,
            right: coords.x + this.grabbedThing.width / 2,
            top: coords.y - this.grabbedThing.height / 2,
            bottom: coords.y + this.grabbedThing.height / 2
        });
        return {
            src: this.grabbedThing.src,
            worldX: snapped.left + this.grabbedThing.width / 2,
            worldY: snapped.top + this.grabbedThing.height / 2,
            width: this.grabbedThing.width / 256,
            height: this.grabbedThing.height / 256,
        };
    }

    onWorkbenchMouseMove = (evt: React.MouseEvent) => {
        if (this.grabbedThing == null) {
            return;
        }
        this.updateGrab({
            ...this.grabbedThing,
            clientX: evt.clientX,
            clientY: evt.clientY
        });
    }

    onWorkbenchMouseUp = (evt: React.MouseEvent) => {
        evt.preventDefault();
        this.dispatch(stopGrabbing());
        if (!this.displayService.isInsideCanvas({ x: evt.clientX, y: evt.clientY })) {
            return;
        }
        const item = this.getPendingDropItem();
        if (item == null) {
            return;
        }
        this.dispatch(pushSceneToUndoStack());
        const parent = this.scene.objects.find(o => o.guid === this.scene.selection?.objectId);
        let guid = parent?.guid;
        if (parent == null || guid == null) {
            guid = String(uniqId());
            this.dispatch(createObject({guid, properties: {
                transform: {
                    rotation: 0, scaleX: 1, scaleY: 1, x: item.worldX - 0.5, y: item.worldY - 0.5
                }
            }}));
        }
        const id = String(uniqId());
        const stub = { ownerId: guid, spriteId: id };
        this.dispatch(createSprite(stub));
        this.dispatch(editSprite({
            ...stub,
            properties: {
                background: false,
                name: 'my sprite',
                src: item.src,
                transform: {
                    rotation: 0, scaleX: item.width, scaleY: item.height, 
                    x: item.worldX - (parent?.properties.transform.x ?? item.worldX - 0.5), y: item.worldY - (parent?.properties.transform.y ?? item.worldY - 0.5)
                }
            }
        }));
    }
}

export const DragAndDropServiceModule = createServiceModule(DragAndDropService);
