import * as React from 'react';

import { callback } from '../hooks/utils';
import { TextInput, TextInputProps } from './TextInput';

export interface EditableTextProps {
    value: string;
    onChange: (value: string) => void;
    forceEditing?: boolean;
    height?: TextInputProps['height'];
    onFocus?: () => void;
}

export function EditableText(props: EditableTextProps) {

    const [editing, setEditing] = React.useState(false);

    React.useEffect(() => {
        if (props.forceEditing === true) {
            setEditing(true);
        }
    }, [props.forceEditing]);

    const startEditing = startEditingCb(setEditing);
    const stopEditing = stopEditingCb(setEditing);
    const onKeyDown = keyDownCb(startEditing);

    return <>{
        editing ? 
            <TextInput height={props.height} value={props.value} onChange={props.onChange} onBlur={stopEditing} focus></TextInput> : 
            <div onKeyDown={onKeyDown} tabIndex={0} onFocus={props.onFocus} className="ui-editable-text-resting" onDoubleClick={startEditing}>{props.value || <>&nbsp;</>}</div> 
    }</>;
}

const startEditingCb = callback((setEditing: (editing: boolean) => void) => () => setEditing(true));
const stopEditingCb = callback((setEditing: (editing: boolean) => void) => () => setEditing(false));
const keyDownCb = callback((startEditing: () => void) => (evt: React.KeyboardEvent) => {
    if (evt.key === ' ' || evt.key === 'Enter') {
        evt.preventDefault();
        startEditing();
    }
});