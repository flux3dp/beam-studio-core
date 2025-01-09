import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Button, Col, Flex, Progress, Row, Spin } from 'antd';
import { ClockCircleOutlined, FileOutlined, LoadingOutlined } from '@ant-design/icons';

import DeviceConstants from 'app/constants/device-constants';
import FormatDuration from 'helpers/duration-formatter';
import { Mode } from 'app/constants/monitor-constants';
import { MonitorContext } from 'app/contexts/MonitorContext';

import useI18n from 'helpers/useI18n';
import { IDeviceInfo } from 'interfaces/IDevice';
import { promarkModels } from 'app/actions/beambox/constant';
import FramingTaskManager, { FramingType } from 'helpers/device/framing';
import FramingIcons from 'app/icons/framing/FramingIcons';
import { useFramingTaskManager } from 'app/components/dialogs/FramingModal/useFramingTaskManager';
import MonitorControl from './MonitorControl';
import styles from './MonitorTask.module.scss';

const defaultImage = 'core-img/ph_l.png';

interface Props {
  device: IDeviceInfo;
}

const MonitorTask = ({ device }: Props): JSX.Element => {
  const lang = useI18n();
  const tFraming = lang.framing;
  const { taskTime, mode, report, uploadProgress, taskImageURL, fileInfo, previewTask } =
    useContext(MonitorContext);
  const isPromark = useMemo(() => promarkModels.has(device.model), [device.model]);
  /* for Promark framing */
  const options = [FramingType.Framing] as const;
  const manager = useRef<FramingTaskManager>(null);
  const [playing, setPlaying] = useState<boolean>(false);
  const [type, setType] = useState<FramingType>(options[0]);
  /* for Promark framing */

  const getJobTime = (): string => {
    if (mode === Mode.WORKING && report && report.prog) {
      return `${FormatDuration(Math.max(taskTime * (1 - report.prog), 1))} ${lang.monitor.left}`;
    }

    return typeof taskTime === 'number' ? FormatDuration(Math.max(taskTime, 1)) : null;
  };

  /* for Promark framing */
  const handleFramingStop = useCallback(() => {
    manager.current?.stopFraming();
  }, []);

  const handleFramingStart = useCallback(
    (forceType?: FramingType) => manager.current?.startFraming(forceType ?? type, { lowPower: 0 }),
    [type]
  );

  const renderIcon = useCallback(
    (parentType: FramingType) => {
      if (playing && parentType === type) {
        return <Spin indicator={<LoadingOutlined spin />} />;
      }

      switch (parentType) {
        case FramingType.Framing:
          return <FramingIcons.Framing className={styles['icon-framing']} />;
        case FramingType.Hull:
          return <FramingIcons.Hull className={styles['icon-framing']} />;
        case FramingType.AreaCheck:
          return <FramingIcons.AreaCheck className={styles['icon-framing']} />;
        default:
          return null;
      }
    },
    [playing, type]
  );

  const renderPromarkFramingButton = (): JSX.Element => {
    if (!isPromark) {
      return null;
    }

    return (
      <Flex>
        {options.map((option) => (
          <Button
            key={`monitor-framing-${option}`}
            onClick={
              playing
                ? handleFramingStop
                : () => {
                    setType(option);
                    setPlaying(true);
                    handleFramingStart(option);
                  }
            }
            icon={renderIcon(option)}
          >
            {tFraming.framing}
          </Button>
        ))}
      </Flex>
    );
  };
  /* for Promark framing */

  const renderProgress = (): JSX.Element => {
    if (playing) {
      return renderPromarkFramingButton();
    }

    if (uploadProgress !== null) {
      return (
        <Progress
          percent={Number(uploadProgress)}
          status="active"
          strokeColor={{ from: '#108ee9', to: '#87d068' }}
        />
      );
    }

    if (!report || !report?.prog) {
      if (isPromark) {
        return renderPromarkFramingButton();
      }

      return null;
    }

    const percentageDone = Number((report.prog * 100).toFixed(1));

    if (report?.st_id === DeviceConstants.status.COMPLETED || percentageDone === 100) {
      if (isPromark) {
        return renderPromarkFramingButton();
      }

      return <Progress percent={100} />;
    }

    if (report.st_id === DeviceConstants.status.ABORTED) {
      return <Progress percent={percentageDone} status="exception" />;
    }

    return (
      <Progress
        percent={percentageDone}
        status="active"
        strokeColor={{ from: '#108ee9', to: '#87d068' }}
      />
    );
  };

  const renderFileInfo = (): JSX.Element => {
    const fileName = fileInfo ? fileInfo[0] : previewTask?.fileName;

    return (
      <div className={styles['left-text']}>
        <FileOutlined />
        &nbsp;
        {fileName || lang.monitor.task.BEAMBOX}
      </div>
    );
  };

  useFramingTaskManager({ manager, device, setPlaying });

  return (
    <div className={styles.task}>
      <div className={styles['info-container']}>
        <img src={taskImageURL || defaultImage} />
        <div className={styles['info-bar']}>
          <Row>
            <Col span={24} md={12}>
              {renderFileInfo()}
            </Col>
            <Col span={24} md={12}>
              <div className={styles['right-text']}>
                <ClockCircleOutlined />
                &nbsp;
                {getJobTime()}
              </div>
            </Col>
          </Row>
        </div>
      </div>
      <Row>
        <Col span={24} md={12}>
          {renderProgress()}
        </Col>
        <Col span={24} md={12}>
          <div className={styles['control-buttons']}>
            <MonitorControl isPromark={isPromark} playing={playing} />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default MonitorTask;
