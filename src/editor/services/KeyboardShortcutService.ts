import { popSceneFromRedoStack, popSceneFromUndoStack, removeSelectedSprite } from 'editor/state/actions';
import { AppActions } from 'editor/state/reducer';
import { SceneSelection } from 'editor/state/state';
import { effect } from 'editor/ui/hooks/utils';
import * as React from 'react';
import { PersistenceService } from './PersistenceService';

export class KeyboardShortcutService {

    constructor(private readonly persistenceService: PersistenceService) {
    }

    useKeyboardShortcuts = effect((dispatch: React.Dispatch<AppActions>, selection: SceneSelection) => {
        const handler = (evt: KeyboardEvent) => {
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
                    break;
                case 'Delete':
                    if (selection?.type === 'sprite') {
                        dispatch(removeSelectedSprite());
                    }
                    break;
            }
            console.log(evt.key);
        }
        window.addEventListener('keydown', handler);
        return () => {
            window.removeEventListener('keydown', handler);
        }
    });
}