/* eslint-disable no-console */
import { IDeviceInfo } from 'interfaces/IDevice';
import storage from 'implementations/storage';
// import * as Sentry from '@sentry/electron';

let isSentryInited = false;
const sendDevices: { [uuid: string]: string } = {};
// const sendDevices: { [uuid: string]: string } = storage.get('sentry-send-devices') || {};

// eslint-disable-next-line @typescript-eslint/dot-notation
const Sentry = window['nodeModules']['@sentry/electron'];

const initSentry = (): void => {
  if (storage.get('enable-sentry')) {
    console.log('Sentry Initiated');
    Sentry.init({ dsn: 'https://bbd96134db9147658677dcf024ae5a83@o28957.ingest.sentry.io/5617300' });
    isSentryInited = true;
    Sentry.captureMessage('User Census', {
      level: 'info',
      tags: {
        census: 'v1',
        from: 'renderer',
      },
    });
  }
};

const sendDeviceInfo = (device: IDeviceInfo): void => {
  if (isSentryInited) {
    if (!sendDevices[device.uuid]) {
      Sentry.captureMessage('Device Info', {
        level: 'info',
        tags: {
          'device-lastversion': 'no',
          'device-uuid': device.uuid,
          'device-version': device.version,
          'device-model': device.model,
        },
      });
      sendDevices[device.uuid] = device.version;
      storage.set('sentry-send-devices', sendDevices);
    } else if (sendDevices[device.uuid] !== device.version) {
      Sentry.captureMessage('Device Info', {
        level: 'info',
        tags: {
          'device-lastversion': sendDevices[device.uuid],
          'device-uuid': device.uuid,
          'device-version': device.version,
          'device-model': device.model,
        },
      });
      sendDevices[device.uuid] = device.version;
      storage.set('sentry-send-devices', sendDevices);
    }
  }
};

export default {
  initSentry,
  sendDeviceInfo,
};
