import classNames from 'classnames';
import React from 'react';

import i18n from 'helpers/i18n';

interface Props {
  size: string;
  estTime: string;
  lightTime: string;
  rapidTime: string;
  cutDist: string;
  rapidDist: string;
  currentPosition: string;
  handleStartHere: () => void;
  togglePathPreview: () => void;
}

class SidePanel extends React.PureComponent<Props> {
  // eslint-disable-next-line class-methods-use-this
  renderDataBlock(label: string, value: string): JSX.Element {
    return (
      <div className="data-block">
        <div className="item">{label}</div>
        <div className="value">{value}</div>
      </div>
    );
  }

  render(): JSX.Element {
    const className = classNames({ win: window.os === 'Windows' });
    const {
      size, estTime, lightTime, rapidTime, cutDist, rapidDist, currentPosition,
      handleStartHere, togglePathPreview,
    } = this.props;
    const LANG = i18n.lang.beambox.path_preview;
    return (
      <div id="path-preview-side-panel" className={className}>
        <div className="title">{LANG.preview_info}</div>
        <div className="datas">
          {this.renderDataBlock(LANG.size, size)}
          {this.renderDataBlock(LANG.estimated_time, estTime)}
          {this.renderDataBlock(LANG.cut_time, lightTime)}
          {this.renderDataBlock(LANG.rapid_time, rapidTime)}
          {this.renderDataBlock(LANG.cut_distance, cutDist)}
          {this.renderDataBlock(LANG.rapid_distance, rapidDist)}
          {this.renderDataBlock(LANG.current_position, currentPosition)}
        </div>
        <div className="remark">
          {LANG.remark}
        </div>
        <div className="buttons">
          <div className="btn btn-default primary" onClick={handleStartHere}>
            {LANG.start_here}
          </div>
          <div className="btn btn-default" onClick={togglePathPreview}>
            {LANG.end_preview}
          </div>
        </div>
      </div>
    );
  }
}

export default SidePanel;
