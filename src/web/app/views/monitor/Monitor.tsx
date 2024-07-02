import React, { useContext, useMemo } from 'react';
import { Modal, Tabs } from 'antd';
import { CameraOutlined, FolderOutlined, PictureOutlined } from '@ant-design/icons';

import deviceConstants from 'app/constants/device-constants';
import localeHelper from 'helpers/locale-helper';
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
  device: IDeviceInfo;
}

const Monitor = (props: Props): JSX.Element => {
  const { device } = props;
  const { currentPath, mode, onClose, report, setMonitorMode, taskImageURL, uploadProgress } =
    useContext(MonitorContext);
  const LANG = useI18n();
  const taskMode = report.st_id === deviceConstants.status.IDLE ? Mode.PREVIEW : Mode.WORKING;
  const monitorMode = [Mode.PREVIEW, Mode.FILE_PREVIEW, Mode.WORKING].includes(mode)
    ? taskMode
    : mode;

  const tabItems = [
    taskImageURL ? {
      label: (
        <div>
          <PictureOutlined />
          {LANG.monitor.taskTab}
        </div>
      ),
      key: taskMode,
      children: <MonitorTask />,
    } : null,
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
    (localeHelper.isNorthAmerica ? null : {
      label: (
        <div>
          <CameraOutlined />
          {LANG.monitor.camera}
        </div>
      ),
      key: Mode.CAMERA,
      children: <MonitorCamera device={device} />,
    }),
  ].filter((item) => item) as { label: JSX.Element; key: Mode; children: JSX.Element }[]

  const statusText = useMemo(() => {
    if (uploadProgress) return LANG.beambox.popup.progress.uploading;
    if (report) return MonitorStatus.getDisplayStatus(report.st_label);
    return LANG.monitor.connecting;
  }, [LANG, report, uploadProgress]);

  return (
    <Modal open centered onCancel={onClose} title={`${device.name} - ${statusText}`} footer={null}>
      <Tabs
        activeKey={monitorMode}
        items={tabItems}
        onChange={(key: Mode) => setMonitorMode(key)}
        tabBarExtraContent={<MonitorTabExtraContent />}
      />
    </Modal>
  );
};

export default Monitor;
