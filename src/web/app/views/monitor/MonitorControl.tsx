import React from 'react';
import classNames from 'classnames';

import DeviceConstants from 'app/constants/device-constants';
import i18n from 'helpers/i18n';
import MonitorStatus, { ButtonTypes } from 'helpers/monitor-status';
import { Mode } from 'app/constants/monitor-constants';
import { MonitorContext, useMonitorContext } from 'app/contexts/MonitorContext';
import { Button, Space } from 'antd';
import { CloseCircleFilled, PauseCircleFilled, PlayCircleFilled, StopFilled } from '@ant-design/icons';

const LANG = i18n.lang.monitor;

const MonitorControl = (): JSX.Element => {
  const {
    onPlay,
    onPause,
    onStop,
    mode,
    report,
  } = useMonitorContext();
  const mapButtonTypeToElement = (type: ButtonTypes): JSX.Element => {
    const enabled = type % 2 === 1;
    switch (type) {
      case ButtonTypes.PLAY:
      case ButtonTypes.DISABLED_PLAY:
        return (
          <Button key={type} disabled={!enabled} type="primary" onClick={onPlay}>
            <PlayCircleFilled />
            {LANG.go}
          </Button>
        );
      case ButtonTypes.PAUSE:
      case ButtonTypes.DISABLED_PAUSE:
        return (
          <Button key={type} disabled={!enabled} type="primary" onClick={onPause}>
            <PauseCircleFilled />
            {LANG.pause}
          </Button>
        );
      case ButtonTypes.STOP:
      case ButtonTypes.DISABLED_STOP:
        return (
          <Button key={type} disabled={!enabled} onClick={onStop}>
            <StopFilled />
            {LANG.stop}
          </Button>
        );
      default:
        return null;
    }
  }

  // const renderRelocateButton = (): JSX.Element => {
  //   const { isMaintainMoving, onRelocate } = this.context;
  //   const className = classNames('controls right', { disabled: isMaintainMoving });
  //   return (
  //     <div className={className} onClick={onRelocate}>
  //       <div className="btn-control btn-relocate">
  //         <img src="img/beambox/icon-target.svg" />
  //       </div>
  //       <div className="description">{LANG.relocate}</div>
  //     </div>
  //   );
  // // }

  // const renderUploadButton = (enable: boolean): JSX.Element => {
  //   const { onUpload } = this.context;
  //   const containerClass = classNames('controls left', { disabled: !enable });
  //   return (
  //     <div className={containerClass} onClick={onUpload}>
  //       <div className="btn-upload btn-control" />
  //       <input className="upload-control" type="file" accept=".fc" onChange={onUpload} />
  //       <div className="description">{LANG.upload}</div>
  //     </div>
  //   );
  // }

  const canStart = !!report && report.st_id === DeviceConstants.status.IDLE;

  if (mode === Mode.PREVIEW || mode === Mode.FILE_PREVIEW) {
    return (
      <Space>
        <Button disabled={!canStart} type="primary" onClick={onPlay}>
          <PlayCircleFilled />
          {LANG.go}
        </Button>
      </Space>
    );
  } if (mode === Mode.WORKING) {
    return (
      <Space>
        {MonitorStatus.getControlButtonType(report).map((v) => mapButtonTypeToElement(v))}
      </Space>
    );
  }
  return <div />;
};

export default MonitorControl;
