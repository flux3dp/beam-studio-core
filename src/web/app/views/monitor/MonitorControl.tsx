import React, { useContext } from 'react';
import { Button, Space } from 'antd';
import { PauseCircleFilled, PlayCircleFilled, StopFilled } from '@ant-design/icons';

import DeviceConstants from 'app/constants/device-constants';
import MonitorStatus, { ButtonTypes } from 'helpers/monitor-status';
import { useIsMobile } from 'helpers/system-helper';
import { Mode } from 'app/constants/monitor-constants';
import { MonitorContext } from 'app/contexts/MonitorContext';
import useI18n from 'helpers/useI18n';

interface Props {
  isPromark: boolean;
  playing: boolean;
}

const MonitorControl = ({ isPromark, playing }: Props): JSX.Element => {
  const { monitor: LANG } = useI18n();
  const isMobile = useIsMobile();
  const buttonShape = isMobile ? 'round' : 'default';
  const { onPlay, onPause, onStop, mode, report } = useContext(MonitorContext);
  const mapButtonTypeToElement = (type: ButtonTypes): JSX.Element => {
    const enabled = type % 2 === 1;

    switch (type) {
      case ButtonTypes.PLAY:
      case ButtonTypes.DISABLED_PLAY:
        return (
          <Button
            key={type}
            disabled={!enabled}
            shape={buttonShape}
            type="primary"
            onClick={() => onPlay(isPromark)}
          >
            <PlayCircleFilled />
            {report.st_id !== DeviceConstants.status.PAUSED ? LANG.go : LANG.resume}
          </Button>
        );
      case ButtonTypes.PAUSE:
      case ButtonTypes.DISABLED_PAUSE:
        return (
          <Button
            key={type}
            disabled={!enabled}
            shape={buttonShape}
            type="primary"
            onClick={onPause}
          >
            <PauseCircleFilled />
            {LANG.pause}
          </Button>
        );
      case ButtonTypes.STOP:
      case ButtonTypes.DISABLED_STOP:
        return (
          <Button key={type} disabled={!enabled} shape={buttonShape} onClick={onStop}>
            <StopFilled />
            {LANG.stop}
          </Button>
        );
      default:
        return null;
    }
  };

  const canStart = report?.st_id === DeviceConstants.status.IDLE;

  if (mode === Mode.PREVIEW || mode === Mode.FILE_PREVIEW || playing) {
    return (
      <Space>
        <Button disabled={!canStart} shape={buttonShape} type="primary" onClick={() => isPromark}>
          <PlayCircleFilled />
          {LANG.go}
        </Button>
      </Space>
    );
  }

  if (mode === Mode.WORKING) {
    return (
      <Space>
        {MonitorStatus.getControlButtonType(report).map((type) => mapButtonTypeToElement(type))}
      </Space>
    );
  }

  return null;
};

export default MonitorControl;
