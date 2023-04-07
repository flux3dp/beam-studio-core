import React, { useContext } from 'react';
import { Modal, Tabs } from 'antd';
import { CameraOutlined, FolderOutlined, PictureOutlined } from '@ant-design/icons';

import MonitorStatus from 'helpers/monitor-status';
import useI18n from 'helpers/useI18n';
import { Mode } from 'app/constants/monitor-constants';
import { MonitorContext } from 'app/contexts/MonitorContext';
import { IDeviceInfo } from 'interfaces/IDevice';

import MonitorCamera from './MonitorCamera';
import MonitorFilelist from './MonitorFilelist';
// import MonitorRelocate from './MonitorRelocate';
import MonitorTabExtraContent from './MonitorTabExtraContent';
import MonitorTask from './MonitorTask';

interface Props {
  mode?: string;
  device: IDeviceInfo
}

const Monitor = (props: Props): JSX.Element => {
  const { device } = props;
  const { currentPath, mode, onClose, report, setMonitorMode, taskImageURL } = useContext(MonitorContext);
  const LANG = useI18n();

  // const renderRelocate = (): JSX.Element => {
  //   return (
  //     <MonitorRelocate
  //       device={device}
  //     />
  //   );
  // };

  const render = (): JSX.Element => {
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
        children: <MonitorFilelist path={currentPath.join('/')} />,
      },
      {
        label: (
          <div>
            <CameraOutlined />
            {LANG.monitor.camera}
          </div>
        ),
        key: Mode.CAMERA,
        children: <MonitorCamera device={device} />,
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
              <MonitorTask />
            </div>
          ),
        },
      );
    }
    return (
      <Modal
        open
        centered
        onCancel={onClose}
        title={`${device.name} - ${report ? MonitorStatus.getDisplayStatus(report.st_label) : LANG.monitor.connecting}`}
        footer={null}
      >
        <Tabs
          activeKey={monitorMode}
          items={tabItems}
          onChange={(key: Mode) => setMonitorMode(key)}
          tabBarExtraContent={<MonitorTabExtraContent />}
        />
      </Modal>
    );
  };
  return render();
};

export default Monitor;
