import * as React from "react";

export interface PanelProps {
    title: string;
}

export function Panel(props: React.PropsWithChildren<PanelProps>) {
    return <div className="editor-panel">
        <div className="panel-title">{props.title}</div>
        <div className="panel-content">
            { props.children }
        </div>
    </div>;
}