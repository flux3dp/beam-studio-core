/* eslint-disable no-param-reassign */
import MessageCaller, { MessageLevel } from 'app/actions/message-caller';
import FramingTaskManager from 'helpers/device/framing';
import { IDeviceInfo } from 'interfaces/IDevice';

import { useEffect } from 'react';

interface Props {
  manager: React.MutableRefObject<FramingTaskManager | null>;
  device: IDeviceInfo;
  onStatusChange: (status: boolean) => void;
}

const key = 'useFramingTaskManager';

/* eslint-disable import/prefer-default-export */
export const useFramingTaskManager = ({ manager, device, onStatusChange }: Props): void => {
  useEffect(() => {
    manager.current = new FramingTaskManager(device);

    manager.current.on('status-change', onStatusChange);
    manager.current.on('close-message', () => MessageCaller.closeMessage(key));
    manager.current.on('message', (content: string) => {
      MessageCaller.openMessage({ key, level: MessageLevel.LOADING, content });
    });

    return () => {
      manager.current?.stopFraming();
      MessageCaller.closeMessage(key);
    };
  }, [device, manager, onStatusChange]);
};
