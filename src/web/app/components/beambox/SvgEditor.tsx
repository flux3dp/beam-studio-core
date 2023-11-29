import React from 'react';
import classNames from 'classnames';

import constant from 'app/actions/beambox/constant';
import PathPreview from 'app/components/beambox/path-preview/PathPreview';
import storage from 'implementations/storage';
import svgEditor from 'app/actions/beambox/svg-editor';
import Workarea from 'app/components/beambox/Workarea';
import ZoomBlock from 'app/components/beambox/ZoomBlock';
import { CanvasContext } from 'app/contexts/CanvasContext';

import styles from './SvgEditor.module.scss';

export default class SvgEditor extends React.Component {
  componentDidMount(): void {
    const { $ } = window;
    $(svgEditor.init);
  }

  // eslint-disable-next-line class-methods-use-this
  handleDisableHref(e): void {
    e.preventDefault();
    e.stopPropagation();
  }

  private renderSvgEditor = () => {
    const { isPathPreviewing } = this.context;
    const platformClassNames = classNames({ mac: window.os === 'MacOS', [styles.mac]: window.os === 'MacOS' });
    return (
      <div
        id="svg_editor"
        className={platformClassNames}
        style={isPathPreviewing ? { display: 'none' } : {}}
      >
        <div>
          <div id="rulers" className={classNames(styles.rulers, platformClassNames)}>
            <div className={styles.corner} />
            <div id="ruler_x" className={styles.x}>
              <div>
                <canvas height={15} />
              </div>
            </div>
            <div id="ruler_y" className={styles.y}>
              <div>
                <canvas width={15} />
              </div>
            </div>
            <div className={styles.unit}>
              {storage.get('default-units') === 'inches' ? 'inch' : 'mm'}
            </div>
          </div>
          <Workarea className={platformClassNames} />
          <div id="main_button">
            <div id="main_icon" className="tool_button" title="Main Menu">
              <div id="main_menu">
                {}
                <ul>
                  <li
                    id="tool_open"
                    style={{
                      display: 'none',
                    }}
                  >
                    <div id="fileinputs">
                      <div />
                    </div>
                    Open SVG
                  </li>
                  <li
                    id="tool_import"
                    style={{
                      display: 'none',
                    }}
                  >
                    <div id="fileinputs_import">
                      <div />
                    </div>
                    Import Image
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div id="tools_top" className="tools_panel">
            <div id="editor_panel">
              <div className="push_button" id="tool_source" title="Edit Source [U]" />
            </div>
            <div id="text_panel">
              <input id="text" type="text" size={35} />
            </div>
          </div>
          <div id="cur_context_panel" />
          <div id="tools_left" className="tools_panel">
            <div className="tool_button" id="tool_select" title="Select Tool" />
            <div className="tool_button" id="tool_fhpath" title="Pencil Tool" />
            <div className="tool_button" id="tool_line" title="Line Tool" />
            <div className="tool_button" id="tool_path" title="Path Tool" />
            <div className="tool_button" id="tool_text" title="Text Tool" />
            <div className="tool_button" id="tool_image" title="Image Tool" />
            <div
              style={{
                display: 'none',
              }}
            >
              <div id="tool_rect" title="Rectangle" />
              <div id="tool_square" title="Square" />
              <div id="tool_fhrect" title="Free-Hand Rectangle" />
              <div id="tool_ellipse" title="Ellipse" />
              <div id="tool_path" title="Path" />
              <div id="tool_polygon" title="Polygon" />
              <div id="tool_grid" title="Grid Array" />
              <div id="tool_circle" title="Circle" />
              <div id="tool_fhellipse" title="Free-Hand Ellipse" />
            </div>
            <div className="tool_button" id="tool_path" title="Path Tool" />
            <div className="tool_button" id="tool_text" title="Text Tool" />
            <div className="tool_button" id="tool_image" title="Image Tool" />
            <div className="tool_button" id="tool_zoom" title="Zoom Tool [Ctrl+Up/Down]" />
            <div
              style={{
                display: 'none',
              }}
            >
              <div id="tool_rect" title="Rectangle" />
              <div id="tool_square" title="Square" />
              <div id="tool_fhrect" title="Free-Hand Rectangle" />
              <div id="tool_ellipse" title="Ellipse" />
              <div id="tool_path" title="Path" />
              <div id="tool_polygon" title="Polygon" />
              <div id="tool_grid" title="Grid Array" />
              <div id="tool_circle" title="Circle" />
              <div id="tool_fhellipse" title="Free-Hand Ellipse" />
            </div>
          </div>
          <div id="tools_bottom" className="tools_panel">
            <div id="tools_bottom_2">
              <div id="color_tools">
                <div className="color_tool" id="tool_fill">
                  <label className="icon_label" htmlFor="fill_color" title="Change fill color" />
                  <div className="color_block">
                    <div id="fill_bg" />
                    <div id="fill_color" className="color_block" />
                  </div>
                </div>
              </div>
              <div className="color_tool" id="tool_stroke">
                <label className="icon_label" title="Change stroke color" />
                <div className="color_block">
                  <div id="stroke_bg" />
                  <div id="stroke_color" className="color_block" title="Change stroke color" />
                </div>
                <label className="stroke_label">
                  <input
                    id="stroke_width"
                    title="Change stroke width by 1, shift-click to change by 0.1"
                    size={2}
                    defaultValue={5}
                    type="text"
                    data-attr="Stroke Width"
                  />
                </label>
                <div id="toggle_stroke_tools" title="Show/hide more stroke tools" />
                <label className="stroke_tool">
                  <select id="stroke_style" defaultValue="none" title="Change stroke dash style">
                    <option value="none">—</option>
                    <option value="2,2">...</option>
                    <option value="5,5">- -</option>
                    <option value="5,2,2,2">- .</option>
                    <option value="5,2,2,2,2,2">- ..</option>
                  </select>
                </label>
                <div className="stroke_tool dropdown" id="stroke_linejoin">
                  <div id="cur_linejoin" title="Linejoin: Miter" />
                  <button type="button" />
                </div>
                <div className="stroke_tool dropdown" id="stroke_linecap">
                  <div id="cur_linecap" title="Linecap: Butt" />
                  <button type="button" />
                </div>
              </div>
              <div className="color_tool" id="tool_opacity" title="Change selected item opacity">
                <label>
                  <span id="group_opacityLabel" className="icon_label" />
                  <input id="group_opacity" size={3} defaultValue={100} type="text" />
                </label>
                <div id="opacity_dropdown" className="dropdown">
                  <button type="button" />
                  <ul>
                    <li>0%</li>
                    <li>25%</li>
                    <li>50%</li>
                    <li>75%</li>
                    <li>100%</li>
                    <li className="special">
                      <div id="opac_slider" />
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div id="option_lists" className="dropdown">
            <ul id="linejoin_opts">
              <li className="tool_button current" id="linejoin_miter" title="Linejoin: Miter" />
              <li className="tool_button" id="linejoin_round" title="Linejoin: Round" />
              <li className="tool_button" id="linejoin_bevel" title="Linejoin: Bevel" />
            </ul>
            <ul id="linecap_opts">
              <li className="tool_button current" id="linecap_butt" title="Linecap: Butt" />
              <li className="tool_button" id="linecap_square" title="Linecap: Square" />
              <li className="tool_button" id="linecap_round" title="Linecap: Round" />
            </ul>
          </div>
          <div id="color_picker" />
        </div>
      </div>
    );
  };

  render(): JSX.Element {
    const { isPathPreviewing } = this.context;
    // HIDE ALMOST ALL TOOLS USING CSS
    return (
      <>
        <div>
          {this.renderSvgEditor()}
          <div id="svg_source_editor">
            <div className="overlay" />
            <div id="svg_source_container">
              <div id="tool_source_back" className="toolbar_button">
                <button id="tool_source_save" type="button">
                  Apply Changes
                </button>
                <button id="tool_source_cancel" type="button">
                  Cancel
                </button>
              </div>
              <div id="save_output_btns">
                <p id="copy_save_note">
                  Copy the contents of this box into a text editor, then save the file with a .svg
                  extension.
                </p>
                <button id="copy_save_done" type="button">
                  Done
                </button>
              </div>
              <form>
                <textarea id="svg_source_textarea" spellCheck="false" defaultValue="" />
              </form>
            </div>
          </div>
          <div id="svg_docprops">
            <div className="overlay" />
            <div id="svg_docprops_container">
              <div id="tool_docprops_back" className="toolbar_button">
                <button id="tool_docprops_save" type="button">
                  OK
                </button>
                <button id="tool_docprops_cancel" type="button">
                  Cancel
                </button>
              </div>
              <fieldset id="svg_docprops_docprops">
                <legend id="svginfo_image_props">Image Properties</legend>
                <label>
                  <span id="svginfo_title">Title:</span>
                  <input type="text" id="canvas_title" />
                </label>
                <fieldset id="change_resolution">
                  <legend id="svginfo_dim">Canvas Dimensions</legend>
                  <label>
                    <span id="svginfo_width">width:</span>{' '}
                    <input type="text" id="canvas_width" size={6} />
                  </label>
                  <label>
                    <span id="svginfo_height">height:</span>{' '}
                    <input type="text" id="canvas_height" size={6} />
                  </label>
                  <label>
                    <select id="resolution" defaultValue="predefined">
                      <option id="selectedPredefined" value="predefined">
                        Select predefined:
                      </option>
                      <option>640x480</option>
                      <option>800x600</option>
                      <option>1024x768</option>
                      <option>1280x960</option>
                      <option>1600x1200</option>
                      <option id="fitToContent" value="content">
                        Fit to Content
                      </option>
                    </select>
                  </label>
                </fieldset>
                <fieldset id="image_save_opts">
                  <legend id="includedImages">Included Images</legend>
                  <label>
                    <input type="radio" name="image_opt" defaultValue="embed" defaultChecked />{' '}
                    <span id="image_opt_embed">Embed data (local files)</span>{' '}
                  </label>
                  <label>
                    <input type="radio" name="image_opt" defaultValue="ref" />{' '}
                    <span id="image_opt_ref">Use file reference</span>{' '}
                  </label>
                </fieldset>
              </fieldset>
            </div>
          </div>
          <div id="svg_prefs">
            <div className="overlay" />
            <div id="svg_prefs_container">
              <div id="tool_prefs_back" className="toolbar_button">
                <button id="tool_prefs_save" type="button">
                  OK
                </button>
                <button id="tool_prefs_cancel" type="button">
                  Cancel
                </button>
              </div>
              <fieldset>
                <legend id="svginfo_editor_prefs">Editor Preferences</legend>
                <label>
                  <span id="svginfo_lang">Language:</span>
                  {}
                  <select id="lang_select" defaultValue="en">
                    <option id="lang_de" value="de">
                      Deutsche
                    </option>
                    <option id="lang_en" value="en">
                      English
                    </option>
                    <option id="lang_zh-TW" value="zh-TW">
                      繁體中文
                    </option>
                    <option id="lang_ja" value="ja">
                      日本語
                    </option>
                    <option id="lang_kr" value="kr">
                      한국어
                    </option>
                    <option id="lang_zh-CN" value="es">
                      Español
                    </option>
                    <option id="lang_pt" value="pt">
                      Português
                    </option>
                    <option id="lang_zh-CN" value="zh-CN">
                      簡中
                    </option>
                    <option id="lang_fr" value="fr">
                      Français
                    </option>
                    <option id="lang_nl" value="nl">
                      Nederlands
                    </option>
                    <option id="lang_pl" value="pl">
                      Polski
                    </option>
                  </select>
                </label>
                <label>
                  <span id="svginfo_icons">Icon size:</span>
                  <select id="iconsize" defaultValue="m">
                    <option id="icon_small" value="s">
                      Small
                    </option>
                    <option id="icon_medium" value="m">
                      Medium
                    </option>
                    <option id="icon_large" value="l">
                      Large
                    </option>
                    <option id="icon_xlarge" value="xl">
                      Extra Large
                    </option>
                  </select>
                </label>
                <fieldset id="change_background">
                  <legend id="svginfo_change_background">Editor Background</legend>
                  <div id="bg_blocks" />
                  <label>
                    <span id="svginfo_bg_url">URL:</span> <input type="text" id="canvas_bg_url" />
                  </label>
                  <p id="svginfo_bg_note">Note: Background will not be saved with image.</p>
                </fieldset>
                <fieldset id="change_grid">
                  <legend id="svginfo_grid_settings">Grid</legend>
                  <label>
                    <span id="svginfo_snap_onoff">Snapping on/off</span>
                    <input type="checkbox" defaultValue="snapping_on" id="grid_snapping_on" />
                  </label>
                  <label>
                    <span id="svginfo_snap_step">Snapping Step-Size:</span>{' '}
                    <input type="text" id="grid_snapping_step" size={3} defaultValue={10} />
                  </label>
                  <label>
                    <span id="svginfo_grid_color">Grid color:</span>{' '}
                    <input type="text" id="grid_color" size={3} defaultValue="#000" />
                  </label>
                </fieldset>
                <fieldset id="units_rulers">
                  <legend id="svginfo_units_rulers">Units & Rulers</legend>
                  <label>
                    <span id="svginfo_rulers_onoff">Show rulers</span>
                    <input
                      type="checkbox"
                      defaultValue="show_rulers"
                      id="show_rulers"
                      defaultChecked
                    />
                  </label>
                  <label>
                    <span id="svginfo_unit">Base Unit:</span>
                    <select id="base_unit">
                      <option value="px">Pixels</option>
                      <option value="cm">Centimeters</option>
                      <option value="mm">Millimeters</option>
                      <option value="in">Inches</option>
                      <option value="pt">Points</option>
                      <option value="pc">Picas</option>
                      <option value="em">Ems</option>
                      <option value="ex">Exs</option>
                    </select>
                  </label>
                  {}
                  {}
                </fieldset>
              </fieldset>
            </div>
          </div>
          <div id="dialog_box">
            <div className="overlay" />
            <div id="dialog_container">
              <div id="dialog_content" />
              <div id="dialog_buttons" />
            </div>
          </div>
        </div>
        {isPathPreviewing && <PathPreview />}
        {!isPathPreviewing && (
          <ZoomBlock
            setZoom={(zoom) => svgEditor.zoomChanged(window, { zoomLevel: zoom / constant.dpmm })}
            resetView={svgEditor.resetView}
          />
        )}
      </>
    );
  }
}

SvgEditor.contextType = CanvasContext;
