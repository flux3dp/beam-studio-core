import classNames from 'classnames';
import React from 'react';

import FormatDuration from 'helpers/duration-formatter';
import i18n from 'helpers/i18n';
import DeviceConstants from 'app/constants/device-constants';
import { Mode } from 'app/constants/monitor-constants';
import { useMonitorContext } from 'app/contexts/MonitorContext';
import {
  Col, Progress, Row, Tag,
} from 'antd';
import { ClockCircleOutlined, FileOutlined } from '@ant-design/icons';
import MonitorControl from './MonitorControl';

const defaultImage = 'img/ph_l.png';
const LANG = i18n.lang;

interface Props {
  deviceVersion: string;
}

const MonitorTask = (props: Props): JSX.Element => {
  const {
    taskTime, mode, report, uploadProgress, taskImageURL, fileInfo, previewTask,
  } = useMonitorContext();

  const getJobTime = (): string => {
    if (mode === Mode.WORKING && report && report.prog) {
      const timeLeft = FormatDuration(taskTime * (1 - report.prog));
      return `${timeLeft} ${i18n.lang.monitor.left}`;
    }
    return taskTime ? FormatDuration(taskTime) : null;
  };

  const renderProgress = (): JSX.Element => {
    if (uploadProgress !== null) {
      return <Progress percent={Number(uploadProgress)} status="active" strokeColor={{ from: '#108ee9', to: '#87d068' }} />;
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

    return <Progress percent={percentageDone} status="active" strokeColor={{ from: '#108ee9', to: '#87d068' }} />;
  };

  const renderFileInfo = (): JSX.Element => {
    const fileName = fileInfo ? fileInfo[0] : previewTask?.fileName;
    return (
      <div className="monitor-left-text">
        <FileOutlined />
        &nbsp;
        {fileName || LANG.monitor.task.BEAMBOX}
      </div>
    );
  };

  const render = (): JSX.Element => (
    <div className="task">
      <div style={{ position: 'relative', marginBottom: 10 }}>
        <img style={{ width: '100%', outline: '1px solid #BBB', outlineOffset: -1 }} src={taskImageURL || defaultImage} />
        <div className="monitor-task-info-bar">
          <Row>
            <Col span={12}>
              {renderFileInfo()}
            </Col>
            <Col span={12}>
              <div className="monitor-right-text">
                <ClockCircleOutlined />
                &nbsp;
                {getJobTime()}
              </div>
            </Col>
          </Row>
        </div>
      </div>
      { /* renderRelocateButton() */ }
      <Row>
        <Col span={12}>
          {renderProgress()}
        </Col>
        <Col span={12}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <MonitorControl />
          </div>
        </Col>
      </Row>
    </div>
  );
  return render();
};

export default MonitorTask;
