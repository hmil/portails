import * as React from 'react';
import { memo } from '../hooks/utils';
import { COLOR_BG_1, COLOR_BG_1_HIGHLIGHT, COLOR_BG_MAIN, COLOR_PRIMARY, COLOR_PRIMARY_HIGHLIGHT, COLOR_TEXT_HIGHLIGHT, COLOR_TEXT_MAIN } from '../style/colors';

export interface ButtonProps {
    value: string;
    active?: boolean;
    disabled?: boolean;
    onClick: (evt: React.MouseEvent) => void;
    size?: 'lg' | 'md' | 'sm';
    style?: React.CSSProperties;
    tooltip?: string;
}

const fontSizeChart = {
    'lg': '20px',
    'md': '16px',
    'sm': '12px'
}

export const Button = React.memo(function _Button(props: ButtonProps) {

    return <button
        onClick={props.onClick}
        title={props.tooltip}
        className={`ui-button ${props.active === true ? 'active' : ''} ${props.disabled === true ? 'disabled' : ''}`}
        style={buttonStyle(props.style, props.size || 'md')}>{props.value}</button>;
});

const buttonStyle = memo((defaultStyle: React.CSSProperties | undefined, size: 'lg' | 'md' | 'sm'): React.CSSProperties => {
    return {
        fontSize: fontSizeChart[size],
        ...defaultStyle
    };
});
