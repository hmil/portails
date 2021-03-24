import { StateContext } from "editor/context/StateContext";
import { SceneSelection } from "editor/state/state";
import * as React from "react";
import { TabsContainer } from "./components/tabs/TabsContainer";
import { TabsEntry } from "./components/tabs/TabsEntry";
import { GeometriesPanel } from "./GeometriesPanel";
import { Panel } from "./Panel";
import { SpritesPanel } from "./SpritesPanel";

export function ObjectDetailsPanel() {

    const { state } = React.useContext(StateContext);

    const [ selectedTab, setSelectedTab ] = React.useState<number>(0);
    const [ lastSelection, setLastSelection ] = React.useState<SceneSelection>(null);

    React.useEffect(() => {
        if (lastSelection != state.scene.selection) {
            if (state.scene.selection?.type === 'geometry') {
                setSelectedTab(1);
            } else if (state.scene.selection?.type === 'sprite') {
                setSelectedTab(0);
            }
            setLastSelection(state.scene.selection);
        }
    }, [state.scene.selection]);

    return <Panel title={"Object"}>
        <TabsContainer selectedTab={selectedTab} onTabSelect={setSelectedTab}>
            <TabsEntry title={"Sprites"}>
                <SpritesPanel></SpritesPanel>
            </TabsEntry>
            <TabsEntry title={"Geometries"}>
                <GeometriesPanel></GeometriesPanel>
            </TabsEntry>
        </TabsContainer>
    </Panel>;
}