import * as React from "react";

const TRIGGER_OFFSET = 3;

export interface DragAndDropHandlers<TAcc> {
    start: (evt: MouseEvent) => TAcc;
    dragging: (evt: MouseEvent, acc: TAcc) => TAcc;
    commit?: (evt: MouseEvent, acc: TAcc) => void;
}

export function useDragAndDrop<TAcc>() {
    return React.useMemo(() => {
        let start: (evt: MouseEvent) => TAcc = () => { throw new Error('not ready'); }
        let dragging: (evt: MouseEvent, acc: TAcc) => TAcc = () => { throw new Error('not ready'); }
        let commit: ((evt: MouseEvent, acc: TAcc) => void) | undefined;
    
        function handler(evt: React.MouseEvent) {
            const startPos = { x: evt.clientX, y: evt.clientY };
            let started = false;
            let acc: TAcc;
    
            function onMove(evt: MouseEvent) {
            
                if (!started) {
                    const dx = startPos.x - evt.clientX;
                    const dy = startPos.y - evt.clientY;
                    
                    if (Math.sqrt(dx*dx + dy*dy) > TRIGGER_OFFSET) {
                        acc = start(evt);
                        started = true;
                    }
                }

                if (started) {
                    acc = dragging(evt, acc);
                }
            }
    
            function onUp(evt: MouseEvent) {
                commit?.(evt, acc);
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);
            }
    
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
        }
    
        return (handlers: DragAndDropHandlers<TAcc>) => {
            start = handlers.start;
            dragging = handlers.dragging;
            commit = handlers.commit;
            return handler;
        }
    }, []);
}