import React from 'react';
import classNames from 'classnames';

import constant from 'app/actions/beambox/constant';
import DpiInfo from 'app/components/beambox/DpiInfo';
import PathPreview from 'app/components/beambox/path-preview/PathPreview';
import storage from 'implementations/storage';
import svgEditor from 'app/actions/beambox/svg-editor';
import Workarea from 'app/components/beambox/svg-editor/Workarea';
import workareaManager from 'app/svgedit/workarea';
import ZoomBlock from 'app/components/beambox/ZoomBlock';
import { CanvasContext, CanvasMode } from 'app/contexts/CanvasContext';

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
    const { mode } = this.context;
    const platformClassNames = classNames({
      mac: window.os === 'MacOS',
      [styles.mac]: window.os === 'MacOS',
    });
    return (
      <div
        id="svg_editor"
        className={platformClassNames}
        style={mode === CanvasMode.PathPreview ? { display: 'none' } : {}}
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
    const { mode } = this.context;
    // HIDE ALMOST ALL TOOLS USING CSS
    return (
      <>
        <div>
          {this.renderSvgEditor()}
          <div id="dialog_box">
            <div className="overlay" />
            <div id="dialog_container">
              <div id="dialog_content" />
              <div id="dialog_buttons" />
            </div>
          </div>
        </div>
        {mode === CanvasMode.PathPreview && <PathPreview />}
        {mode !== CanvasMode.PathPreview && (
          <>
            <ZoomBlock
              setZoom={(zoom) => workareaManager.zoom(zoom / constant.dpmm)}
              resetView={workareaManager.resetView}
            />
            <DpiInfo />
          </>
        )}
      </>
    );
  }
}

SvgEditor.contextType = CanvasContext;
