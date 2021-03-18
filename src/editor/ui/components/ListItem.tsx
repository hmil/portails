import * as React from "react";
import { memo } from "../hooks/utils";

export interface ListItemProps {
    selected?: boolean;
    onClick?: () => void;
}

export function ListItem<T>(props: React.PropsWithChildren<ListItemProps>) {
    const className = elementClass(props.selected ?? false);
    return <div className={className} onClick={props.onClick}>{ props.children }</div>;
}

const elementClass = memo((isSelected: boolean) => `ui-list-item ${isSelected ? 'selected' : ''}`);
