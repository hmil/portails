import { popSceneFromRedoStack, popSceneFromUndoStack } from 'editor/state/actions';
import { AppActions } from 'editor/state/reducer';
import { effect } from 'editor/ui/hooks/utils';
import * as React from 'react';
import { PersistenceService } from './PersistenceService';

export class KeyboardShortcutService {

    constructor(private readonly persistenceService: PersistenceService) {
    }

    useKeyboardShortcuts = effect((dispatch: React.Dispatch<AppActions>) => {
        const handler = this.onKeyDown(dispatch);
        window.addEventListener('keydown', handler);
        return () => {
            window.removeEventListener('keydown', handler);
        }
    });

    private onKeyDown(dispatch: React.Dispatch<AppActions>) {
        return (evt: KeyboardEvent) => {
            switch (evt.key) {
                case 'z':
                case 'Z':
                    if (evt.ctrlKey || evt.metaKey) {
                        if (evt.shiftKey) {
                            dispatch(popSceneFromRedoStack());
                        } else {
                            dispatch(popSceneFromUndoStack());
                        }
                    }
                    break;
                case 's':
                    if (evt.ctrlKey || evt.metaKey) {
                        evt.preventDefault();
                        this.persistenceService.save();
                    }
            }
        }
    }
}