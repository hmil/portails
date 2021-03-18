import * as React from "react";

export interface ListProps<T> {
    renderItem: (t: T) => JSX.Element;
    data: ReadonlyArray<T>;
}

export function List<T>(props: React.PropsWithChildren<ListProps<T>>) {
    return <div className="ui-list">
        {props.data.map(d => props.renderItem(d))}
    </div>
}
