import { StateContext } from 'editor/context/StateContext';
import { DragAndDropServiceModule } from 'editor/services/DragAndDropService';
import { KeyboardShortcutServiceModule } from 'editor/services/KeyboardShortcutService';
import { getSelectedSprite } from 'editor/state/selectors';
import * as React from 'react';

import { AssetsPanel } from './assets/AssetsPanel';
import { Canvas } from './canvas/Canvas';
import { Dock } from './Dock';
import { GrabOverlay } from './GrabOverlay';
import { ObjectDetailsPanel } from './ObjectDetailsPanel';
import { ObjectsPanel } from './ObjectsPanel';
import SpriteDetailsPanel from './SpriteDetailsPanel';
import { Toolbar } from './Toolbar';



export function Workbench() {
    const { state } = React.useContext(StateContext);
    const selectedSprite = getSelectedSprite(state);
    KeyboardShortcutServiceModule.get().useKeyboardShortcuts();
    const dragAndDropService = DragAndDropServiceModule.get();

    return <div className="workbench" onMouseMove={dragAndDropService.onWorkbenchMouseMove} onMouseUp={dragAndDropService.onWorkbenchMouseUp}>
        <Toolbar></Toolbar>
        <div className="central-container">
            <Dock>
                <ObjectsPanel></ObjectsPanel>
                <AssetsPanel></AssetsPanel>
            </Dock>
            <Canvas></Canvas>
            <Dock>
                <ObjectDetailsPanel></ObjectDetailsPanel>
                {
                    selectedSprite != null ? <SpriteDetailsPanel sprite={selectedSprite}></SpriteDetailsPanel> : undefined
                }
            </Dock>
        </div>
        { state.grabbedThing ? <GrabOverlay grabbedThing={state.grabbedThing}></GrabOverlay> : undefined }
    </div>;
}
