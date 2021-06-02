import EventEmitter from 'eventemitter3';
import { IDeviceInfo } from 'interfaces/IDevice';

const UPDATE_EVENT = 'update';

const eventEmitter = new EventEmitter();
export default {
  onUpdate(callback) {
    eventEmitter.on(UPDATE_EVENT, callback);
  },

  emitUpdate(payload: {
    device: IDeviceInfo,
    updateInfo: {
      changelog_en: string,
      changelog_zh: string,
      latestVersion: string,
    },
    onDownload: () => void,
    onInstall: () => void,
  }) {
    eventEmitter.emit(UPDATE_EVENT, payload);
  },
};
