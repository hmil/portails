import * as React from 'react';

import { TabsEntry } from './TabsEntry';

export interface TabsContainerProps {
    selectedTab?: number;
    onTabSelect?: (tab: number) => void;
}

function isElementType<T extends ((props: any) => React.ReactElement<any, any> | null)>(el: React.ReactElement, type: T): el is React.ReactElement<Parameters<T>[0]> {
    return el.type === type;
}

function isDefined<T>(t: T | null | undefined): t is T {
    return t != null;
}

export function TabsContainer(props: React.PropsWithChildren<TabsContainerProps>) {

    const [ selectedIndexInternal, setSelectedIndexInternal ] = React.useState(1);

    const activeIndex = props.selectedTab ?? selectedIndexInternal;

    const tabs = React.Children.map(props.children, (child, i) => {
        if (typeof child === 'object' && child != null && 'props' in child && isElementType(child, TabsEntry)) {
            const isSelected = activeIndex === i;
            return React.cloneElement(child, { isSelected });
        }
    })?.filter(isDefined) ?? [];

    const onClickTab = (index: number) => (evt: React.MouseEvent) => {
        evt.preventDefault();
        setSelectedIndexInternal(index)
        if (props.onTabSelect) {
            props.onTabSelect(index);
        }
    };

    return <div className="tabs-container">
        <div className="tabs-header">
            { tabs.map((tab, i) => <div key={i} onClick={onClickTab(i)} className={tab.props.isSelected ? 'selected' : ''}>{ tab.props.title }</div>)}
        </div>
        <div className="tabs-content">{ tabs }</div>
    </div>;
}

