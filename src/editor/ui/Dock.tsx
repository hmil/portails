import * as React from "react";

export function Dock(props: React.PropsWithChildren<{}>) {
    return <div className="editor-dock">
        {props.children}
    </div>;
}