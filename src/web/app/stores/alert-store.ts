import EventEmitter from 'events';
import { IDeviceInfo } from 'interfaces/IDevice';

const UPDATE_EVENT = 'update';

export default Object.assign(EventEmitter.prototype, {
  onUpdate(callback) {
    this.on(UPDATE_EVENT, callback);
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
    this.emit(UPDATE_EVENT, payload);
  },
});
