import classNames from 'classnames';
import React from 'react';

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

    return (
      <div id="path-preview-side-panel" className={className}>
        <div className="title">Preview Data</div>
        <div className="datas">
          {this.renderDataBlock('Size', size)}
          {this.renderDataBlock('Estimated Time', estTime)}
          {this.renderDataBlock('Light Time', lightTime)}
          {this.renderDataBlock('Rapid Time', rapidTime)}
          {this.renderDataBlock('Cut Distance', cutDist)}
          {this.renderDataBlock('Rapid Distance', rapidDist)}
          {this.renderDataBlock('Current Position', currentPosition)}
        </div>
        <div className="buttons">
          <div className="btn btn-default primary" onClick={handleStartHere}>
            Start Here
          </div>
          <div className="btn btn-default" onClick={togglePathPreview}>
            End Preview
          </div>
        </div>
      </div>
    );
  }
}

export default SidePanel;
