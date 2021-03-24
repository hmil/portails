import { StateContext } from "editor/context/StateContext";
import { ObjectSprite } from "editor/model/sprite";
import { editSprite, pushSceneToUndoStack } from "editor/state/actions";
import produce from "immer";
import * as React from "react";
import { TextInput } from "./components/TextInput";
import { Panel } from "./Panel";

const AVAILABLE_TILES = ["bottom.png", "horizontal_to_vertical_passthrough_right.png", "shallow_slope_right_01.png", "single_pillar_right_end.png", "top.png", "bottom_left.png", "island_center.png", "shallow_slope_right_02.png", "single_pillar_right_join.png", "top_left.png", "bottom_left_inner.png", "island_left.png", "shallow_slope_right_03.png", "single_pillar_top.png", "top_left_inner.png", "bottom_right.png", "island_right.png", "single_pillar_bottom.png", "single_pillar_top_join.png", "top_right.png", "bottom_right_inner.png", "left_edge.png", "single_pillar_bottom_join.png", "single_pillar_vertical.png", "top_right_inner.png", "fill.png", "right_edge.png", "single_pillar_left.png", "steep_slope_left_01.png", "horizontal_to_vertical_end_left.png", "shallow_slope_left_01.png", "single_pillar_left_end.png", "steep_slope_left_02.png", "horizontal_to_vertical_end_right.png", "shallow_slope_left_02.png", "single_pillar_left_join.png", "steep_slope_right_01.png", "horizontal_to_vertical_passthrough_left.png", "shallow_slope_left_03.png", "single_pillar_right.png", "steep_slope_right_02.png"];

export interface SpriteDetailsPanelProps {
    sprite: ObjectSprite;
}

export function SpriteDetailsPanel(props: SpriteDetailsPanelProps) {
    const { dispatch } = React.useContext(StateContext);

    return <Panel title="Sprite">
        <div className="ui-form">
            <div className="ui-form-row">
                <label className="label" htmlFor="sprite-src">src</label>
                <TextInput value={props.sprite.properties.src} onChange={(value) => {
                    dispatch(pushSceneToUndoStack());
                    dispatch(editSprite(produce(props.sprite, draft => {
                        draft.properties.src = value
                    })));
                }} id="sprite-src"></TextInput>
            </div>
            <div className="ui-form-row">
                <label className="label" htmlFor="sprite-width">width</label>
                <TextInput value={String(props.sprite.properties.transform.scaleX)} type="number" onChange={(value) => {
                    dispatch(pushSceneToUndoStack());
                    dispatch(editSprite(produce(props.sprite, draft => {
                        draft.properties.transform.scaleX = Number(value)
                    })));
                }} id="sprite-width"></TextInput>
            </div>
            <div className="ui-form-row">
                <label className="label" htmlFor="sprite-height">height</label>
                <TextInput value={String(props.sprite.properties.transform.scaleY)} type="number" onChange={(value) => {
                    dispatch(pushSceneToUndoStack());
                    dispatch(editSprite(produce(props.sprite, draft => {
                        draft.properties.transform.scaleY = Number(value)
                    })));
                }} id="sprite-height"></TextInput>
            </div>
            <div className="ui-form-row">
                <label className="label" htmlFor="sprite-height">background</label>
                <input type="checkbox" checked={props.sprite.properties.background} onChange={(evt) => {
                    dispatch(pushSceneToUndoStack());
                    dispatch(editSprite(produce(props.sprite, draft => {
                        draft.properties.background = evt.target.checked;
                    })));
                }} />
                {/* <TextInput value={String(props.sprite.properties.transform.scaleY)} type="number" onChange={(value) => {
                    dispatch(pushSceneToUndoStack());
                    dispatch(editSprite(produce(props.sprite, draft => {
                        draft.properties.transform.scaleY = Number(value)
                    })))
                }} id="sprite-height"></TextInput> */}
            </div>
        </div>
        <div style={{ overflow: 'auto'}}>
            <h3 className="panel-section-title">Tiles</h3>
            {
                AVAILABLE_TILES.map(tile =>
                    <img className="tile-picker-tile" src={`/static/tile-pack-2/tiles/${tile}`} key={tile} alt=""
                        onClick={() => {
                            dispatch(pushSceneToUndoStack());
                            dispatch(editSprite(produce(props.sprite, draft => {
                                draft.properties.src = `/static/tile-pack-2/tiles/${tile}`;
                            })));
                        }}/>
                )
            }
        </div>
    </Panel>;
}