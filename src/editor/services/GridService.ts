import { Rectangle } from 'editor/model/geometry';
import { Viewport } from 'editor/model/viewport';
import { DisplayService } from './DisplayService';

export interface GridConfig {
    stepX: number;
    stepY: number;
    offsetX: number;
    offsetY: number;
    enabled: boolean;
}

export const defaultGridConfig: GridConfig = {
    enabled: true,
    offsetX: 0,
    offsetY: 0,
    stepX: 1,
    stepY: 1
};

const SNAP_DISTANCE = 10;

export class GridService {

    constructor(private config: GridConfig, private readonly displayService: DisplayService) {}

    sync(config: GridConfig) {
        this.config = config;
    }

    snapToGrid(rect: Rectangle): Rectangle {
        if (this.config.enabled === false) {
            return rect;
        }

        const snapDistance = this.displayService.zoomIndependentLength(SNAP_DISTANCE);

        const tmp: Rectangle = {...rect};

        const dL = this.snapDiff(rect.left, this.config.stepX, this.config.offsetX, snapDistance);
        const dT = this.snapDiff(rect.top, this.config.stepY, this.config.offsetY, snapDistance);
        const dR = this.snapDiff(rect.right, this.config.stepX, this.config.offsetX, snapDistance);
        const dB = this.snapDiff(rect.bottom, this.config.stepY, this.config.offsetY, snapDistance);

        const dX = Math.abs(dL) < Math.abs(dR) ? dL : dR;
        const dY = Math.abs(dT) < Math.abs(dB) ? dT : dB;

        if (Math.abs(dX) < snapDistance) {
            tmp.left -= dX;
            tmp.right -= dX;
        }
        if (Math.abs(dY) < snapDistance) {
            tmp.top -= dY;
            tmp.bottom -= dY;
        }

        return tmp;
    }

    private snapDiff(pos: number, step: number, offset: number, snapDistance: number) {
        if (pos - offset < 0) {
            return (pos - offset - snapDistance ) % step + snapDistance;
        } else {
            return (pos - offset + snapDistance ) % step - snapDistance;
        }
    }
}