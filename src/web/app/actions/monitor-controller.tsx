import * as React from 'react';
import Dialog from 'app/actions/dialog-caller';
import Monitor from 'app/views/monitor/Monitor';
import { checkBlockedSerial } from 'helpers/device/check-blocked-serial';
import { IDeviceInfo } from 'interfaces/IDevice';
import { Mode } from 'app/constants/monitor-constants';
import { MonitorContextProvider } from 'app/contexts/MonitorContext';

const monitorController = {
  showMonitor: async (
    device: IDeviceInfo,
    mode: Mode = Mode.FILE,
    previewTask?: { fcodeBlob: Blob; taskImageURL: string; taskTime: number; fileName: string },
    autoStart?: boolean
  ): Promise<void> => {
    const res = await checkBlockedSerial(device.serial);
    if (!res) return;
    Dialog.addDialogComponent(
      'monitor',
      <MonitorContextProvider
        device={device}
        mode={mode}
        previewTask={previewTask}
        autoStart={autoStart}
        onClose={() => Dialog.popDialogById('monitor')}
      >
        <Monitor device={device} />
      </MonitorContextProvider>
    );
  },
};

export default monitorController;
