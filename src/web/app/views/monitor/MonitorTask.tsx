import classNames from 'classnames';
import React from 'react';

import FormatDuration from 'helpers/duration-formatter';
import i18n from 'helpers/i18n';
import MonitorStatus from 'helpers/monitor-status';
import VersionChecker from 'helpers/version-checker';
import { Mode } from 'app/constants/monitor-constants';
import { MonitorContext } from 'app/contexts/Monitor-Context';

const defaultImage = 'img/ph_l.png';
const LANG = i18n.lang;

interface Props {
  deviceVersion: string;
}

export default class MonitorTask extends React.PureComponent<Props> {
  getJobTime(): string {
    const { taskTime } = this.context;
    return taskTime ? FormatDuration(taskTime) : null;
  }

  getProgress(): string {
    const { mode, report } = this.context;
    if (mode !== Mode.WORKING || MonitorStatus.isAbortedOrCompleted(report)) {
      return '';
    }
    return report.prog !== undefined ? `${(report.prog * 100).toFixed(1)}%` : '';
  }

  renderImage(): JSX.Element {
    const { taskImageURL } = this.context;
    const divStyle = {
      borderRadius: '2px',
      backgroundColor: '#F0F0F0',
      backgroundImage: `url(${taskImageURL || defaultImage})`,
      backgroundSize: '100% auto',
      backgroundPosition: '50% 50%',
      backgroundRepeatY: 'no-repeat',
      width: '100%',
      height: '100%',
    };
    return (<div style={divStyle} />);
  }

  renderRelocateButton(): JSX.Element {
    const { mode, relocateOrigin, startRelocate } = this.context;
    const { deviceVersion } = this.props;
    const vc = VersionChecker(deviceVersion);
    if ([Mode.PREVIEW, Mode.FILE_PREVIEW].includes(mode) && vc.meetRequirement('RELOCATE_ORIGIN')) {
      return (
        <div className="btn-relocate-container">
          <div className="btn-relocate" onClick={startRelocate}>
            <img src="img/beambox/icon-target.svg" />
            {(relocateOrigin.x !== 0 || relocateOrigin.y !== 0)
              ? <div className="relocate-origin">{`(${relocateOrigin.x}, ${relocateOrigin.y})`}</div>
              : null}
          </div>
        </div>
      );
    }
    return null;
  }

  renderInfo(): JSX.Element {
    const { report } = this.context;
    const infoClass = classNames('status-info', 'running', { hide: MonitorStatus.isAbortedOrCompleted(report) });
    return (
      <div className={infoClass}>
        <div className="verticle-align">
          <div>{LANG.monitor.task.BEAMBOX}</div>
          <div className="status-info-duration">{this.getJobTime()}</div>
        </div>
        {this.renderRelocateButton()}
        <div className="status-info-progress">{this.getProgress()}</div>
      </div>
    );
  }

  render(): JSX.Element {
    return (
      <div className="task">
        {this.renderImage()}
        {this.renderInfo()}
      </div>
    );
  }
}

MonitorTask.contextType = MonitorContext;
