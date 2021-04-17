import { Viewport } from 'editor/model/viewport';
import * as React from 'react';
import { effect, memo } from '../ui/hooks/utils';
import { createServiceModule } from './injector';

export interface DisplayCanvasRect {
    height: number;
    width: number;
    x: number;
    y: number;
}

export interface Coords {
    x: number;
    y: number;
}

/**
 * Provides helpers to convert to/from screen space
 */
export class DisplayService {

    constructor(private viewport: Viewport, private canvas: DisplayCanvasRect) { }

    screenCoordsToWorldCoords(screenCoords: Coords): Coords {
        return {
            x: (screenCoords.x - this.canvas.x - this.canvas.width / 2) / this.viewport.zoomFactor + this.viewport.centerX,
            y: (screenCoords.y - this.canvas.y - this.canvas.height / 2) / this.viewport.zoomFactor + this.viewport.centerY
        };
    }

    zoomIndependentLength(length: number): number {
        return length / this.viewport.zoomFactor;
    }

    isInsideCanvas(coords: Coords) {
        return coords.x < this.canvas.x + this.canvas.width && coords.x > this.canvas.x &&
                coords.y < this.canvas.y + this.canvas.height && coords.y > this.canvas.y;
    }
}

export const DisplayServiceModule = createServiceModule(DisplayService);
