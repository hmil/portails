import {
    duplicateSelectedSprite,
    popSceneFromRedoStack,
    popSceneFromUndoStack,
    pushSceneToUndoStack,
    removeSelectedGeometry,
    removeSelectedObject,
    removeSelectedSprite,
    scrollViewport,
    toggleGridSnapping,
    zoomViewport,
} from 'editor/state/actions';
import { AppActions } from 'editor/state/reducer';
import { uniqId } from 'editor/utils/uid';
import * as React from 'react';

import { createServiceModule } from './injector';
import { PersistenceService } from './PersistenceService';

const ARROW_DISPLACEMENT = 30;
const ZOOM_AMOUNT = 4;

export class KeyboardShortcutService {

    constructor(private readonly dispatch: React.Dispatch<AppActions>, private readonly persistenceService: PersistenceService) {
    }

    useKeyboardShortcuts() {
        React.useEffect(() => {
            const handler = (evt: KeyboardEvent) => {
                switch (evt.key) {
                    case 'z':
                    case 'Z':
                        if (evt.ctrlKey || evt.metaKey) {
                            if (evt.shiftKey) {
                                this.dispatch(popSceneFromRedoStack());
                            } else {
                                this.dispatch(popSceneFromUndoStack());
                            }
                        }
                        break;
                    case 's':
                        if (evt.ctrlKey || evt.metaKey) {
                            evt.preventDefault();
                            this.persistenceService.save();
                        } else {
                            evt.preventDefault();
                            this.dispatch(toggleGridSnapping());
                        }
                        break;
                    case 'Delete':
                        this.dispatch(removeSelectedObject());
                        this.dispatch(removeSelectedSprite());
                        this.dispatch(removeSelectedGeometry());
                        break;
                    case 'd':
                        if (evt.ctrlKey || evt.metaKey) {
                            evt.preventDefault();
                            this.dispatch(pushSceneToUndoStack());
                            this.dispatch(duplicateSelectedSprite({ newId: String(uniqId()) }));
                        }
                        break;
                    case 'ArrowRight':
                        this.dispatch(scrollViewport({ deltaX: ARROW_DISPLACEMENT, deltaY: 0 }));
                        break;
                    case 'ArrowLeft':
                        this.dispatch(scrollViewport({ deltaX: -ARROW_DISPLACEMENT, deltaY: 0 }));
                        break;
                    case 'ArrowUp':
                        this.dispatch(scrollViewport({ deltaX: 0, deltaY: -ARROW_DISPLACEMENT }));
                        break;
                    case 'ArrowDown':
                        this.dispatch(scrollViewport({ deltaX: 0, deltaY: ARROW_DISPLACEMENT }));
                        break;
                    case '-':
                        if (evt.ctrlKey || evt.metaKey) {
                            evt.preventDefault();
                            evt.stopImmediatePropagation();
                            this.dispatch(zoomViewport({ delta: -ZOOM_AMOUNT }));
                        }
                        break;
                    case '+':
                        if (evt.ctrlKey || evt.metaKey) {
                            evt.preventDefault();
                            evt.stopImmediatePropagation();
                            this.dispatch(zoomViewport({ delta: ZOOM_AMOUNT }));
                        }
                        break;
                }
                console.log(evt.key);
            }
            window.addEventListener('keydown', handler);
            return () => {
                window.removeEventListener('keydown', handler);
            }
        }, [this]);
    }
}

export const KeyboardShortcutServiceModule = createServiceModule(KeyboardShortcutService);
