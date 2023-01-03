import * as React from 'react';
import FormatDuration from 'helpers/duration-formatter';
import i18n from 'helpers/i18n';
import isObjectEmpty from 'helpers/is-object-empty';
import { Modal, Tabs } from 'antd';
import { useMonitorContext } from 'app/contexts/MonitorContext';
import { Mode } from 'app/constants/monitor-constants';
import { IDeviceInfo } from 'interfaces/IDevice';
import MonitorStatus from 'helpers/monitor-status';
import {
  CameraOutlined, FileOutlined, FolderOutlined, PictureOutlined,
} from '@ant-design/icons';
import MonitorCamera from './MonitorCamera';
import MonitorFilelist from './MonitorFilelist';
import MonitorInfo from './MonitorInfo';
import MonitorRelocate from './MonitorRelocate';
import MonitorTask from './MonitorTask';

interface Props {
  mode?: string;
  device: IDeviceInfo
}

const Monitor = (props: Props): JSX.Element => {
  const context = useMonitorContext();
  const LANG = i18n.lang;

  const renderFileList = (): JSX.Element => {
    const { currentPath } = context;
    const path = currentPath.join('/');
    return (
      <MonitorFilelist
        path={path}
      />
    );
  };

  const renderTask = (): JSX.Element => {
    const { device } = props;
    return (
      <MonitorTask
        deviceVersion={device.version}
      />
    );
  };

  const renderCamera = (): JSX.Element => {
    const { device } = props;
    return (
      <MonitorCamera
        device={device}
      />
    );
  };

  const renderRelocate = (): JSX.Element => {
    const { device } = props;
    return (
      <MonitorRelocate
        device={device}
      />
    );
  };

  const render = (): JSX.Element => {
    const { device } = props;
    const {
      onClose, mode, report, setMonitorMode, taskImageURL
    } = context;

    const monitorMode = [Mode.PREVIEW, Mode.FILE_PREVIEW, Mode.WORKING].includes(mode)
      ? Mode.PREVIEW : mode;

    const tabItems = [
      {
        label: (
          <div>
            <FolderOutlined />
            {LANG.topmenu.file.label}
          </div>
        ),
        key: Mode.FILE,
        children: renderFileList(),
      },
      {
        label: (
          <div>
            <CameraOutlined />
            {LANG.monitor.camera}
          </div>
        ),
        key: Mode.CAMERA,
        children: renderCamera(),
      },
    ];
    if (taskImageURL) {
      tabItems.unshift(
        {
          label: (
            <div>
              <PictureOutlined />
              {LANG.monitor.taskTab}
            </div>
          ),
          key: Mode.PREVIEW,
          children: (
            <div>
              {renderTask()}
            </div>
          ),
        }
      );
    }
    // body = this.renderRelocate();
    return (
      <Modal
        open
        centered
        onCancel={onClose}
        title={`${device.name} - ${report ? MonitorStatus.getDisplayStatus(report.st_label) : LANG.monitor.connecting}`}
        footer={null}
      >
        <Tabs activeKey={monitorMode} items={tabItems} onChange={(key) => setMonitorMode(key)} />
      </Modal>
    );
  };
  return render();
};

export default Monitor;
