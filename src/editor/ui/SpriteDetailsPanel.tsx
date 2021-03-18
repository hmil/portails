import { StateContext } from "editor/context/StateContext";
import { ObjectSprite } from "editor/model/sprite";
import { editSprite } from "editor/state/actions";
import produce from "immer";
import * as React from "react";
import { TextInput } from "./components/TextInput";
import { Panel } from "./Panel";

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
                    dispatch(editSprite(produce(props.sprite, draft => {
                        draft.properties.src = value
                    })))
                }} id="sprite-src"></TextInput>
            </div>
            <div className="ui-form-row">
                <label className="label" htmlFor="sprite-width">width</label>
                <TextInput value={String(props.sprite.properties.transform.scaleX)} type="number" onChange={(value) => {
                    dispatch(editSprite(produce(props.sprite, draft => {
                        draft.properties.transform.scaleX = Number(value)
                    })))
                }} id="sprite-width"></TextInput>
            </div>
            <div className="ui-form-row">
                <label className="label" htmlFor="sprite-height">height</label>
                <TextInput value={String(props.sprite.properties.transform.scaleY)} type="number" onChange={(value) => {
                    dispatch(editSprite(produce(props.sprite, draft => {
                        draft.properties.transform.scaleY = Number(value)
                    })))
                }} id="sprite-height"></TextInput>
            </div>
        </div>
    </Panel>;
}