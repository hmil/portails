import { memo } from "./utils";

export function useDragAndDrop<TAcc>({ start, dragging, commit }: {
    start: (evt: React.MouseEvent) => TAcc,
    dragging: (evt: MouseEvent, acc: TAcc) => TAcc,
    commit?: (evt: MouseEvent, acc: TAcc) => void
}) {
    return memo((
        start: (evt: React.MouseEvent) => TAcc,
        dragging: (evt: MouseEvent, acc: TAcc) => TAcc,
        commit?: (evt: MouseEvent, acc: TAcc) => void
    ) =>
        (evt: React.MouseEvent) => {
            let acc = start(evt);
    
            function onMove(evt: MouseEvent) {
                acc = dragging(evt, acc);
            }

            function onUp(evt: MouseEvent) {
                commit?.(evt, acc);
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);
            }

            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
        }
    )(start, dragging, commit);
}