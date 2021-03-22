import { Viewport } from 'editor/model/viewport';
import { effect } from '../ui/hooks/utils';

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

    sync = effect((viewport: Viewport, canvas: DisplayCanvasRect) => {
        this.setViewport(viewport);
        this.setScreen(canvas);
    });

    private setViewport(viewport: Viewport) {
        this.viewport = viewport;
    }

    private setScreen(screen: DisplayCanvasRect) {
        this.canvas = screen;
    }

    screenCoordsToWorldCoords(screenCoords: Coords): Coords {
        return {
            x: (screenCoords.x - this.canvas.x - this.canvas.width / 2) / this.viewport.zoomFactor,
            y: (screenCoords.y - this.canvas.y - this.canvas.height / 2) / this.viewport.zoomFactor
        };
    }

    zoomIndependentLength(length: number): number {
        return length / this.viewport.zoomFactor;
    }
}