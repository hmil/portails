import * as React from "react";

export interface PanelProps {
    title?: string;
}

export function Panel(props: React.PropsWithChildren<PanelProps>) {
    return <div className="editor-panel">
        { props.title ? <div className="panel-title">{props.title}</div> : undefined }
        <div className="panel-content">
            { props.children }
        </div>
    </div>;
}