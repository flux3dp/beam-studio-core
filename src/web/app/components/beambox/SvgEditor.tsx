import React from 'react';
import classNames from 'classnames';

import constant from 'app/actions/beambox/constant';
import PathPreview from 'app/components/beambox/path-preview/PathPreview';
import storage from 'implementations/storage';
import svgEditor from 'app/actions/beambox/svg-editor';
import Workarea from 'app/components/beambox/Workarea';
import workareaManager from 'app/svgedit/workarea';
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
    const platformClassNames = classNames({
      mac: window.os === 'MacOS',
      [styles.mac]: window.os === 'MacOS',
    });
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
          <div id="tool_import" style={{ display: 'none' }} />
          <input id="text" type="text" size={35} />
          <div id="cur_context_panel" />
          <div id="option_lists" className="dropdown" />
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
            setZoom={(zoom) => workareaManager.zoom(zoom / constant.dpmm)}
            resetView={svgEditor.resetView}
          />
        )}
      </>
    );
  }
}

SvgEditor.contextType = CanvasContext;
