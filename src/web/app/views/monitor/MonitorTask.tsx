import React, { useContext } from 'react';
import { Col, Progress, Row } from 'antd';
import { ClockCircleOutlined, FileOutlined } from '@ant-design/icons';

import DeviceConstants from 'app/constants/device-constants';
import FormatDuration from 'helpers/duration-formatter';
import i18n from 'helpers/i18n';
import { Mode } from 'app/constants/monitor-constants';
import { MonitorContext } from 'app/contexts/MonitorContext';

import MonitorControl from './MonitorControl';
import styles from './MonitorTask.module.scss';

const defaultImage = 'core-img/ph_l.png';
const LANG = i18n.lang;

const MonitorTask = (): JSX.Element => {
  const { taskTime, mode, report, uploadProgress, taskImageURL, fileInfo, previewTask } =
    useContext(MonitorContext);

  const getJobTime = (): string => {
    if (mode === Mode.WORKING && report && report.prog) {
      const timeLeft = FormatDuration(Math.max(taskTime * (1 - report.prog), 1));
      return `${timeLeft} ${i18n.lang.monitor.left}`;
    }
    return typeof taskTime === 'number' ? FormatDuration(Math.max(taskTime, 1)) : null;
  };

  const renderProgress = (): JSX.Element => {
    if (uploadProgress !== null) {
      return (
        <Progress
          percent={Number(uploadProgress)}
          status="active"
          strokeColor={{ from: '#108ee9', to: '#87d068' }}
        />
      );
    }
    if (!report) return null;

    if (report.st_id === DeviceConstants.status.COMPLETED) {
      return <Progress percent={100} />;
    }

    if (!report.prog) {
      return null;
    }

    const percentageDone = Number((report.prog * 100).toFixed(1));
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
        {fileName || LANG.monitor.task.BEAMBOX}
      </div>
    );
  };

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
      {/* renderRelocateButton() */}
      <Row>
        <Col span={24} md={12}>
          {renderProgress()}
        </Col>
        <Col span={24} md={12}>
          <div className={styles['control-buttons']}>
            <MonitorControl />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default MonitorTask;
