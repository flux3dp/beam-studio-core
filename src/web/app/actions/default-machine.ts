/**
 * initialize machine helper
 */
import storage from 'helpers/storage-helper';
import { IDeviceInfo } from 'interfaces/IDevice';

export default {
    set: (device) => {
      storage.set('default-printer', JSON.stringify(device));
    },
    exist: () => {
        let defaultPrinter: IDeviceInfo = storage.get('default-printer') as IDeviceInfo;
        return (defaultPrinter && 'string' === typeof defaultPrinter.uuid);
    },
    get: () => {
        return storage.get('default-printer') || {};
    },
    clear: () => {
      storage.removeAt('default-printer');
    }
};
