import * as React from 'react';
import { COLOR_BG_1, COLOR_BG_MAIN, COLOR_TEXT_MAIN } from '../style/colors';

export interface TextInputProps {
    value: string;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    style?: React.CSSProperties;
    focus?: boolean;
    placeholder?: string;
    id?: string;
    // Higher is lighter
    height?: 1 | 2;
    type?: 'text' | 'number';
}

export const TextInput = React.memo(function _TextInput(props: TextInputProps) {

    const [value, setValue] = React.useState(props.value);
    let cancelled = false;

    const ref = React.createRef<HTMLInputElement>();
    const inputType = props.type ?? 'text';

    React.useEffect(() => {
        setValue(props.value);
    }, [props.value]);

    React.useEffect(() => {
        if (ref.current != null && props.focus === true) {
            ref.current.focus();
            ref.current.setSelectionRange(0, 1000);
        }
    }, [props.focus, ref.current])

    function onBlur() {
        if (props.onBlur) {
            props.onBlur();
        }
        if (props.onChange && !cancelled) {
            props.onChange(value);
            setValue(props.value);
        } else {
            setValue(props.value);
        }
    }

    function onKeyDown(evt: React.KeyboardEvent) {
        if (evt.key === 'Enter') {
            (evt.target as HTMLInputElement).blur();
        } else if (evt.key === 'Escape') {
            setValue(props.value);
            cancelled = true;
            (evt.target as HTMLInputElement).blur();
        }
    }

    const backgroundColor = props.height === 2 ? COLOR_BG_1 : COLOR_BG_MAIN;

    return <input 
        type={inputType}
        id={props.id}
        className="ui-text-input"
        style={{
            backgroundColor: backgroundColor,
            color: COLOR_TEXT_MAIN,
            fontSize: 'inherit',
            outline: 'none',
            width: '100%',
            ...props.style
        }}
        ref={ref}
        value={value}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        placeholder={props.placeholder}
        onChange={evt => setValue(evt.target.value)} />
});