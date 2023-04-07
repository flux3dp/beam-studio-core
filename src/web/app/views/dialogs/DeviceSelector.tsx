import { Modal } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

import discover from 'helpers/api/discover';
import i18n from 'helpers/i18n';
import { IDeviceInfo } from 'interfaces/IDevice';

interface Props {
  onSelect: (device: IDeviceInfo) => void;
  onClose: () => void;
}

// TODO: change spinner to antd spinner, change styles to modules.scss
const DeviceSelector = ({ onSelect, onClose }: Props): JSX.Element => {
  const [deviceList, setDeviceList] = useState([]);
  const discoverer = useMemo(() => discover('device-selector', (discoverdDevices) => {
    const filteredDevices = discoverdDevices.filter((device) => device.serial !== 'XXXXXXXXXX');
    filteredDevices.sort((deviceA, deviceB) => deviceA.name.localeCompare(deviceB.name));
    setDeviceList(filteredDevices);
  }), []);
  useEffect(() => () => {
    discoverer.removeListener('device-selector');
  }, [discoverer]);

  const status = i18n.lang.machine_status;
  const list = deviceList.length > 0 ? deviceList.map((device: IDeviceInfo) => {
    const statusText = status[device.st_id] || status.UNKNOWN;
    const img = `img/icon_${device.source === 'h2h' ? 'usb' : 'wifi'}.svg`;
    let progress = '';

    if (device.st_id === 16 && typeof device.st_prog === 'number') {
      progress = `${(device.st_prog * 100).toFixed(1)}%`;
    }

    return (
      <li
        key={device.uuid}
        onClick={() => {
          onSelect(device);
          onClose();
        }}
        data-testid={device.serial}
      >
        <label className="name">{device.name}</label>
        <label className="status">{statusText}</label>
        <label className="progress">{progress}</label>
        <label className="connection-type">
          <div className="type">
            <img src={img} />
          </div>
        </label>
      </li>
    );
  }) : (<div key="spinner-roller" className="spinner-roller spinner-roller-reverse" />);

  return (
    <Modal
      open
      closable={false}
      centered
      onCancel={() => {
        onSelect(null);
        onClose();
      }}
      width={385}
      footer={null}
    >
      <div className="device-list">
        <ul>{list}</ul>
      </div>
    </Modal>
  );
};

export default DeviceSelector;
