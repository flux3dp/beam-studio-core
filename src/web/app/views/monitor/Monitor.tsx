import * as React from 'react';
import i18n from 'helpers/i18n';
import { Modal, Tabs } from 'antd';
import { useMonitorContext } from 'app/contexts/MonitorContext';
import { Mode } from 'app/constants/monitor-constants';
import { IDeviceInfo } from 'interfaces/IDevice';
import MonitorStatus from 'helpers/monitor-status';
import {
  CameraOutlined, FolderOutlined, PictureOutlined,
} from '@ant-design/icons';
import Draggable from 'react-draggable';
import MonitorCamera from './MonitorCamera';
import MonitorFilelist from './MonitorFilelist';
import MonitorRelocate from './MonitorRelocate';
import MonitorTask from './MonitorTask';

interface Props {
  mode?: string;
  device: IDeviceInfo
}

const Monitor = (props: Props): JSX.Element => {
  const context = useMonitorContext();
  const LANG = i18n.lang;
  const DraggableElement: any = Draggable;

  const modalRender = (modal): JSX.Element => (
    <DraggableElement>
      {modal}
    </DraggableElement>
  );

  const renderFileList = (): JSX.Element => {
    const { currentPath } = context;
    const path = currentPath.join('/');
    return (
      <MonitorFilelist
        path={path}
      />
    );
  };

  const renderTask = (): JSX.Element => <MonitorTask />;

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
      onClose, mode, report, setMonitorMode, taskImageURL,
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
        },
      );
    }
    // body = this.renderRelocate();
    return (
      <Modal
        open
        centered
        modalRender={modalRender}
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
