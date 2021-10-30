import { StateContext } from 'editor/context/StateContext';
import * as React from 'react';
import { TextInput } from '../components/TextInput';
import { Panel } from '../Panel';

import { AssetSpriteItem } from './AssetSpriteItem';

type TilesDirectory = { name: string; data: Array<string | TilesDirectory> };

const AVAILABLE_TILES: TilesDirectory = {
    "name": ".",
    "data": [
        {
            "name": "static",
            "data": [
                {
                    "name": "tile-pack-2",
                    "data": [
                        {
                            "name": "background",
                            "data": [
                                "background.png",
                                "repeating_floor.png",
                                "repeating_floor_top_part.png"
                            ]
                        },
                        {
                            "name": "bg_overlay_props",
                            "data": [
                                "background_overlays_01.png",
                                "background_overlays_02.png",
                                "background_overlays_03.png",
                                "background_overlays_04.png",
                                "background_overlays_05.png",
                                "background_overlays_06.png",
                                "background_overlays_07.png",
                                "background_overlays_08.png",
                                "background_overlays_09.png",
                                "background_overlays_10.png",
                                "background_overlays_11.png",
                                "background_overlays_12.png",
                                "background_overlays_13.png",
                                "background_overlays_14.png",
                                "background_overlays_15.png",
                                "background_overlays_16.png",
                                "background_overlays_17.png",
                                "background_overlays_18.png",
                                "background_overlays_19.png",
                                "background_overlays_20.png",
                                "background_overlays_21.png",
                                "background_overlays_22.png",
                                "background_overlays_23.png",
                                "background_overlays_24.png",
                                "background_overlays_25.png",
                                "background_overlays_26.png",
                                "background_overlays_27.png",
                                "background_overlays_28.png",
                                "background_overlays_29.png",
                                "background_overlays_30.png",
                                "background_overlays_31.png",
                                "background_overlays_32.png",
                                "background_overlays_33.png",
                                "background_overlays_34.png",
                                "background_overlays_35.png",
                                "background_overlays_36.png",
                                "background_overlays_37.png",
                                {
                                    "name": "cheverons",
                                    "data": [
                                        "cheverons_bottom.png",
                                        "cheverons_repeating.png",
                                        "cheverons_top.png"
                                    ]
                                },
                                {
                                    "name": "fan",
                                    "data": [
                                        "fan.png",
                                        "fan_unit.png"
                                    ]
                                },
                                {
                                    "name": "pipes",
                                    "data": [
                                        "bottom_left.png",
                                        "bottom_right.png",
                                        "horizontal.png",
                                        "top_left.png",
                                        "top_right.png",
                                        "vert.png"
                                    ]
                                }
                            ]
                        },
                        {
                            "name": "overlay_props",
                            "data": [
                                {
                                    "name": "cheveron",
                                    "data": [
                                        "cheveron_bottom_end.png",
                                        "cheveron_middle.png",
                                        "cheveron_top_end.png"
                                    ]
                                },
                                {
                                    "name": "circuit_piece_overlay",
                                    "data": [
                                        "circuit_piece_overlay_01.png",
                                        "circuit_piece_overlay_02.png",
                                        "circuit_piece_overlay_03.png",
                                        "circuit_piece_overlay_04.png",
                                        "circuit_piece_overlay_05.png"
                                    ]
                                },
                                {
                                    "name": "fan_overlay",
                                    "data": [
                                        "fan.png",
                                        "fan_unit.png"
                                    ]
                                },
                                {
                                    "name": "pipe_overlay",
                                    "data": [
                                        "pipe_bottom_left.png",
                                        "pipe_bottom_right.png",
                                        "pipe_horizontal.png",
                                        "pipe_top_left.png",
                                        "pipe_top_right.png",
                                        "pipe_vert.png"
                                    ]
                                },
                                "tile_set_overlay_01.png",
                                "tile_set_overlay_02.png",
                                "tile_set_overlay_03.png",
                                "tile_set_overlay_04.png",
                                "tile_set_overlay_05.png",
                                "tile_set_overlay_06.png",
                                "tile_set_overlay_07.png",
                                "tile_set_overlay_08.png",
                                "tile_set_overlay_09.png",
                                "tile_set_overlay_10.png",
                                "tile_set_overlay_11.png",
                                "tile_set_overlay_12.png",
                                "tile_set_overlay_13.png",
                                "tile_set_overlay_14.png",
                                "tile_set_overlay_15.png",
                                "tile_set_overlay_16.png",
                                "tile_set_overlay_17.png",
                                "tile_set_overlay_18.png",
                                "tile_set_overlay_19.png",
                                "tile_set_overlay_20.png",
                                "tile_set_overlay_21.png",
                                "tile_set_overlay_22.png",
                                "tile_set_overlay_23.png",
                                "tile_set_overlay_24.png",
                                "tile_set_overlay_25.png",
                                "tile_set_overlay_26.png",
                                "tile_set_overlay_27.png",
                                "tile_set_overlay_28.png",
                                "tile_set_overlay_29.png",
                                "tile_set_overlay_30.png",
                                "tile_set_overlay_31.png",
                                "tile_set_overlay_32.png",
                                "tile_set_overlay_33.png",
                                "tile_set_overlay_34.png",
                                "tile_set_overlay_35.png",
                                "tile_set_overlay_36.png",
                                "tile_set_overlay_37.png"
                            ]
                        },
                        {
                            "name": "tiles",
                            "data": [
                                "bottom.png",
                                "bottom_left.png",
                                "bottom_left_inner.png",
                                "bottom_right.png",
                                "bottom_right_inner.png",
                                "fill.png",
                                "horizontal_to_vertical_end_left.png",
                                "horizontal_to_vertical_end_right.png",
                                "horizontal_to_vertical_passthrough_left.png",
                                "horizontal_to_vertical_passthrough_right.png",
                                "island_center.png",
                                "island_left.png",
                                "island_right.png",
                                "left_edge.png",
                                "right_edge.png",
                                "shallow_slope_left_01.png",
                                "shallow_slope_left_02.png",
                                "shallow_slope_left_03.png",
                                "shallow_slope_right_01.png",
                                "shallow_slope_right_02.png",
                                "shallow_slope_right_03.png",
                                "single_pillar_bottom.png",
                                "single_pillar_bottom_join.png",
                                "single_pillar_left.png",
                                "single_pillar_left_end.png",
                                "single_pillar_left_join.png",
                                "single_pillar_right.png",
                                "single_pillar_right_end.png",
                                "single_pillar_right_join.png",
                                "single_pillar_top.png",
                                "single_pillar_top_join.png",
                                "single_pillar_vertical.png",
                                "steep_slope_left_01.png",
                                "steep_slope_left_02.png",
                                "steep_slope_right_01.png",
                                "steep_slope_right_02.png",
                                "top.png",
                                "top_left.png",
                                "top_left_inner.png",
                                "top_right.png",
                                "top_right_inner.png"
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};

function isDir(t: TilesDirectory | string): t is TilesDirectory {
    return typeof t === 'object';
}

function isFile(t: TilesDirectory | string): t is string {
    return typeof t === 'string';
}

function getTilesForPath(path: string): TilesDirectory | null{
    return path.split('/').filter(t => t).reduce<TilesDirectory | null>((acc, el) => {
        if (acc == null) {
            return null;
        }
        const dir = acc.data.filter(isDir).find(d => d.name === el);
        if (!dir) {
            return null;
        }
        return dir;
    }, { name: "/", data: [AVAILABLE_TILES] });
}


export function AssetsPanel() {

    const [ path, setPath ] = React.useState('./static/tile-pack-2/tiles');
    const { state, dispatch } = React.useContext(StateContext);

    const tiles = getTilesForPath(path);

    return <Panel title="Assets">
        <TextInput value={path} onChange={setPath}></TextInput>
        <div className="assets-folder" onClick={() => setPath(path.split('/').slice(0, -1).join('/'))}>📁 ..</div>
        { tiles?.data.filter(isDir).map(dir => <div onClick={() => setPath(path + '/' + dir.name)} className="assets-folder" key={dir.name}>📁 {dir.name}</div>) }
        <hr/>
        {
            tiles?.data.filter(isFile).map(src =>
                <AssetSpriteItem selection={state.scene.selection} dispatch={dispatch} key={src} src={`${path}/${src}`}></AssetSpriteItem>
            )
        }
    </Panel>;
}

