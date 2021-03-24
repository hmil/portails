import * as React from "react";

export interface Tab {
    title: string;
    id: string;
}

export interface TabsContext {
    tabs: Array<Tab>;
    setTabs: (tabs: Array<Tab>) => void;
}

export const TabsContext = React.createContext<TabsContext>({
    tabs: [],
    setTabs() {}
});