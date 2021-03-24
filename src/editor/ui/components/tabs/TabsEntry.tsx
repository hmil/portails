import * as React from 'react';

export interface TabsEntryProps {
    title: string;
    /** @internal */
    isSelected?: boolean;
}

export function TabsEntry(props: React.PropsWithChildren<TabsEntryProps>) {

    return <>{ props.isSelected ? props.children : undefined }</>;
}