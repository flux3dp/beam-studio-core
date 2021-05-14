/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
import Alert from 'app/actions/alert-caller';
import Dialog from 'app/actions/dialog-caller';
import Progress from 'app/actions/progress-caller';
import AlertConstants from 'app/constants/alert-constants';
import { SelectionResult, ConnectionError } from 'app/constants/connection-constants';
import DeviceConstants from 'app/constants/device-constants';
import InputLightBoxConstants from 'app/constants/input-lightbox-constants';
import { IDeviceInfo, IDeviceConnection } from 'interfaces/IDevice';

import Camera from './api/camera';
import Config from './api/config';
import Control from './api/control';
import Discover from './api/discover';
import Touch from './api/touch';
import i18n from './i18n';
import sprintf from './sprintf';
import VersionChecker from './version-checker';

let { lang } = i18n;
const updateLang = () => {
  lang = i18n.lang;
};

class DeviceMaster {
  private deviceConnections: Map<string, IDeviceConnection>;

  private discoveredDevices: IDeviceInfo[];

  private unnotifiedDeviceUUIDs: string[] = [];

  public currentDevice: IDeviceConnection;

  constructor() {
    updateLang();
    this.deviceConnections = new Map<string, IDeviceConnection>();
    this.discoveredDevices = [];
    Discover(
      'device-master',
      (devices) => {
        this.discoveredDevices = devices;
        this.scanDeviceError(devices);
      },
    );
  }

  scanDeviceError = (devices: IDeviceInfo[]) => {
    devices.forEach((info) => {
      const deviceConn = this.getDeviceByUUID(info.uuid);
      if (typeof deviceConn.errors === 'string') {
        if (deviceConn.errors !== info.error_label && info.error_label) {
          Alert.popUp({
            type: AlertConstants.SHOW_POPUP_ERROR,
            message: `${info.name}: ${info.error_label}`,
          });
          deviceConn.errors = info.error_label;
        } else if (!info.error_label) {
          deviceConn.errors = [];
        }
      } else {
        deviceConn.errors = [];
      }
      const { PAUSED_FROM_RUNNING, COMPLETED, ABORTED } = DeviceConstants.status;
      if ([
        PAUSED_FROM_RUNNING, COMPLETED, ABORTED,
      ].includes(info.st_id)) {
        if (this.unnotifiedDeviceUUIDs.find((uuid) => uuid === info.uuid)) {
          let message = '';
          if (deviceConn.info.st_id === DeviceConstants.status.COMPLETED) {
            message = `${lang.device.completed}`;
          } else if (deviceConn.info.st_id === DeviceConstants.status.ABORTED) {
            message = `${lang.device.aborted}`;
          } else {
            if (!info.error_label) {
              return;
            }
            message = `${lang.device.pausedFromError}`;
            message = deviceConn.info.error_label === '' ? '' : message;
          }

          const index = this.unnotifiedDeviceUUIDs.findIndex((uuid) => uuid === info.uuid);
          this.unnotifiedDeviceUUIDs.splice(index, 1);

          if (Config().read('notification') === 1) {
            Notification.requestPermission((permission) => {
              if (permission === 'granted') {
                const notification = new Notification(deviceConn.info.name, {
                  icon: 'img/icon-home-s.png',
                  body: message,
                });
                console.log(notification);
              }
            });
          }
        }
      } else if ([DeviceConstants.status.RUNNING].includes(info.st_id)) {
        if (!this.unnotifiedDeviceUUIDs.find((uuid) => uuid === info.uuid)) {
          this.unnotifiedDeviceUUIDs.push(info.uuid);
        }
      }
    });
  };

  // device are stored in array _devices
  getAvailableDevices() {
    return this.discoveredDevices;
  }

  get currentControlMode() {
    if (this.currentDevice && this.currentDevice.control) {
      return this.currentDevice.control.getMode();
    }
    return null;
  }

  private getDeviceByUUID(uuid: string): IDeviceConnection | null {
    if (!this.deviceConnections.get(uuid)) {
      this.deviceConnections.set(uuid, {
        info: {
          uuid,
        } as IDeviceInfo,
        control: null,
        errors: null,
        camera: null,
        cameraNeedsFlip: null,
      });
    }
    const matchedInfo = this.discoveredDevices.filter((d) => d.uuid === uuid);
    if (matchedInfo[0]) {
      Object.assign(this.deviceConnections.get(uuid).info, matchedInfo[0]);
    }
    return this.deviceConnections.get(uuid);
  }

  private async createDeviceControlSocket(uuid: string) {
    const controlSocket = new Control(uuid);
    await controlSocket.connect();
    return controlSocket;
  }

  setDeviceControlDefaultCloseListener(deviceInfo: IDeviceInfo) {
    const { uuid } = deviceInfo;
    const device = this.deviceConnections.get(uuid);
    if (!device || !device.control) {
      console.warn(`Control socket of ${uuid} does not exist`);
      return;
    }
    const controlSocket = device.control;
    controlSocket.removeAllListeners('close');
    controlSocket.on('close', () => {
      this.closeConnection(uuid);
    });
  }

  setDeviceControlReconnectOnClose(deviceInfo: IDeviceInfo) {
    const { uuid } = deviceInfo;
    const device = this.deviceConnections.get(uuid);
    if (!device || !device.control) {
      console.warn(`Control socket of ${uuid} does not exist`);
      return;
    }
    const controlSocket = device.control;
    controlSocket.removeAllListeners('close');
    controlSocket.on('close', async () => {
      console.log(`Reconnecting ${uuid}`);
      const mode = controlSocket.getMode();
      const { isLineCheckMode, lineNumber } = controlSocket;
      const res = await this.selectDevice(deviceInfo);
      if (res && res.success) {
        if (mode === 'maintain') {
          await this.enterMaintainMode();
        } else if (mode === 'raw') {
          await this.enterRawMode();
          device.control.isLineCheckMode = isLineCheckMode;
          device.control.lineNumber = lineNumber;
        }
        if (device.camera !== null) {
          await this.connectCamera();
        }
        this.setDeviceControlReconnectOnClose(deviceInfo);
      } else {
        console.error('Error when reconnect to device', res.error);
        this.closeConnection(uuid);
      }
    });
  }

  async showAuthDialog(uuid: string): Promise<boolean> { // return authed or not
    const device = this.getDeviceByUUID(uuid);
    const authResult = await new Promise<{ success: boolean, data: any, password: string }>(
      (resolve) => {
        Dialog.showInputLightbox('auth', {
          caption: sprintf(lang.input_machine_password.require_password, device.info.name),
          inputHeader: lang.input_machine_password.password,
          confirmText: lang.input_machine_password.connect,
          type: InputLightBoxConstants.TYPE_PASSWORD,
          onSubmit: async (password: string) => {
            resolve(await this.auth(device.info.uuid, password));
          },
          onCancel: () => {
            resolve({ success: false, data: 'cancel', password: '' });
          },
        });
      },
    );

    if (authResult.success) {
      device.info.plaintext_password = authResult.password;
      return true;
    }
    if (authResult.data !== 'cancel') {
      const message = (
        authResult.data.reachable
          ? lang.select_device.auth_failure
          : lang.select_device.unable_to_connect);
      Alert.popById('device-auth-fail');
      Alert.popUp({
        id: 'device-auth-fail',
        message,
        type: AlertConstants.SHOW_POPUP_ERROR,
      });
      // Display the dialog again
      return await this.showAuthDialog(device.info.uuid);
    }
    return false;
  }

  async auth(uuid: string, password?: string) {
    Progress.openNonstopProgress({
      id: 'device-master-auth',
      message: lang.message.authenticating,
      timeout: 30000,
    });
    const res = await new Promise<{ success: boolean, data: any, password: string }>((resolve) => {
      Touch({
        onError: (data) => {
          Progress.popById('device-master-auth');
          resolve({ success: false, data, password });
        },
        onSuccess: (data) => {
          Progress.popById('device-master-auth');
          resolve({ success: true, data, password });
        },
        onFail: (data) => {
          Progress.popById('device-master-auth');
          resolve({ success: false, data, password });
        },
      }).send(uuid, password || '');
    });
    return res;
  }

  async select(deviceInfo: IDeviceInfo): Promise<SelectionResult> {
    // Alias for selectDevice
    return this.selectDevice(deviceInfo);
  }

  async selectDevice(deviceInfo: IDeviceInfo): Promise<SelectionResult> {
    // Match the device from the newest received device list
    if (!deviceInfo) {
      return { success: false };
    }

    const { uuid } = deviceInfo;
    const device: IDeviceConnection = this.getDeviceByUUID(uuid);
    console.log('Selecting', deviceInfo, device);
    Progress.openNonstopProgress({
      id: 'select-device',
      message: sprintf(lang.message.connectingMachine, device.info.name || deviceInfo.name),
      timeout: 30000,
    });

    if (device.control && device.control.isConnected) {
      try {
        // Update device status
        if (device.control.getMode() !== 'raw') {
          const controlSocket = device.control;
          const info = await controlSocket.addTask(controlSocket.report);
          Object.assign(device.info, info.device_status);
        }
        this.currentDevice = device;
        Progress.popById('select-device');
        return { success: true };
      } catch (e) {
        await device.control.killSelf();
      }
    }

    try {
      const controlSocket = await this.createDeviceControlSocket(uuid);
      device.control = controlSocket;
      this.setDeviceControlDefaultCloseListener(deviceInfo);
      this.currentDevice = device;
      console.log(`Connected to ${uuid}`);
      Progress.popById('select-device');
      return {
        success: true,
      };
    } catch (e) {
      let error = e;
      Progress.popById('select-device');
      console.error(error);
      if (e.error) error = e.error;
      let errorCode = '';
      if (typeof error === 'string') {
        errorCode = error.replace(/^.*:\s+(\w+)$/g, '$1').toUpperCase();
      }
      // AUTH_FAILED seems to not be used by firmware and fluxghost anymore. Keep it just in case.
      if ([
        ConnectionError.AUTH_ERROR,
        ConnectionError.AUTH_FAILED,
      ].includes(errorCode as ConnectionError)) {
        if (device.info.password) {
          const authed = await this.showAuthDialog(uuid);
          if (authed) {
            return await this.selectDevice(deviceInfo);
          }
          return { success: false };
        }
        Progress.openNonstopProgress({
          id: 'select-device',
          message: sprintf(lang.message.connectingMachine, device.info.name),
          timeout: 30000,
        });
        const authResult = await this.auth(uuid);
        if (!authResult.success) {
          Progress.popById('select-device');
          Alert.popUp({
            id: 'auth-error-with-diff-computer', // ADD new error code?
            message: lang.message.auth_error,
            type: AlertConstants.SHOW_POPUP_ERROR,
          });
          return { success: false };
        }
        return await this.selectDevice(deviceInfo);
      }

      let errCaption = '';
      let errMessage = lang.message.unknown_error;
      switch (errorCode) {
        case ConnectionError.TIMEOUT:
          errMessage = lang.message.connectionTimeout;
          break;
        case ConnectionError.FLUXMONITOR_VERSION_IS_TOO_OLD:
          errMessage = lang.message.monitor_too_old.content;
          errCaption = lang.message.monitor_too_old.caption;
          break;
        case ConnectionError.NOT_FOUND:
          errMessage = lang.message.unable_to_find_machine;
          break;
        case ConnectionError.DISCONNECTED:
          errMessage = `#891 ${lang.message.disconnected}`;
          if (this.discoveredDevices.some((d) => d.uuid === uuid)) {
            errMessage = `#892 ${lang.message.disconnected}`;
          }
          break;
        case ConnectionError.UNKNOWN_DEVICE:
          errMessage = lang.message.unknown_device;
          break;
        default:
          errMessage = `${lang.message.unknown_error} ${errorCode}`;
      }
      Alert.popById('connection-error');
      Alert.popUp({
        id: 'connection-error',
        caption: errCaption,
        message: errMessage,
        type: AlertConstants.SHOW_POPUP_ERROR,
      });
      return {
        success: false,
        error: errorCode as ConnectionError,
      };
    } finally {
      Progress.popById('select-device');
    }
  }

  async reconnect() {
    this.deviceConnections.delete(this.currentDevice.info.uuid);
    try {
      await this.currentDevice.control.killSelf();
    } catch (e) {
      console.error(`currentDevice.control.killSelf error ${e}`);
    }
    const res = await this.selectDevice(this.currentDevice.info);
    return res;
  }

  closeConnection(uuid: string) {
    const device: IDeviceConnection = this.getDeviceByUUID(uuid);
    if (device.control) {
      try {
        device.control.connection.close();
      } catch (e) {
        console.error('Error when close control connection', e);
      }
    }
    device.control = null;
  }

  // Player functions
  async go(data, onProgress?: (...args: any[]) => void) {
    const controlSocket = this.currentDevice.control;
    if (!data || !(data instanceof Blob)) {
      return DeviceConstants.READY;
    }

    if (onProgress) {
      controlSocket.setProgressListen(onProgress);
    }
    await controlSocket.addTask(controlSocket.upload, data);
    await controlSocket.addTask(controlSocket.start);
    return null;
  }

  async goFromFile(path: string, fileName: string) {
    const controlSocket = this.currentDevice.control;
    const selectResult = await controlSocket.addTask(controlSocket.select, path, fileName);
    if (selectResult.status.toUpperCase() === DeviceConstants.OK) {
      const startResult = await controlSocket.addTask(controlSocket.start);
      return startResult;
    }
    return { status: 'error' };
  }

  resume() {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.resume);
  }

  pause() {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.pause);
  }

  stop() {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.abort);
  }

  restart() {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.restart);
  }

  quit() {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.quit);
  }

  quitTask() {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.quitTask);
  }

  kick() {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.kick);
  }

  // Calibration and Machine test functions
  async waitTillCompleted() {
    return new Promise((resolve, reject) => {
      const controlSocket = this.currentDevice.control;
      let statusChanged = false;
      const statusCheckInterval = setInterval(async () => {
        const r = await controlSocket.addTask(controlSocket.report);
        const { st_id: stId, error } = r.device_status;
        if (stId === 64) {
          clearInterval(statusCheckInterval);
          await new Promise((resolve2) => setTimeout(resolve2, 2000));
          try {
            await this.quit();
            resolve(null);
          } catch (err) {
            console.error(err);
            reject(Error('Quit failed'));
          }
        } else if ((stId === 128 || stId === 48 || stId === 36) && error && error.length > 0) {
          // Error occured
          clearInterval(statusCheckInterval);
          reject(error);
        } else if (stId === 128) {
          clearInterval(statusCheckInterval);
          reject(error);
        } else if (stId === 0) {
          // Resolve if the status was running and some how skipped the completed part
          if (statusChanged) {
            clearInterval(statusCheckInterval);
            resolve(null);
          }
        } else {
          statusChanged = true;
        }
      }, 2000);
    });
  }

  async runBeamboxCameraTest() {
    const res = await fetch(DeviceConstants.BEAMBOX_CAMERA_TEST);
    const blob = await res.blob();
    const vc = VersionChecker(this.currentDevice.info.version);
    if (vc.meetRequirement('RELOCATE_ORIGIN')) {
      await this.setOriginX(0);
      await this.setOriginY(0);
    }
    try {
      await this.go(blob);
    } catch {
      throw Error('UPLOAD_FAILED');
    }

    Progress.openSteppingProgress({ id: 'camera-cali-task', message: lang.camera_calibration.drawing_calibration_image });
    const taskTotalSecs = 30;
    let elapsedSecs = 0;
    const progressUpdateTimer = setInterval(() => {
      elapsedSecs += 0.1;
      if (elapsedSecs > taskTotalSecs) {
        clearInterval(progressUpdateTimer);
        return;
      }
      Progress.update('camera-cali-task', {
        percentage: (elapsedSecs / taskTotalSecs) * 100,
      });
    }, 100);

    try {
      await this.waitTillCompleted();
      clearInterval(progressUpdateTimer);
      Progress.popById('camera-cali-task');
    } catch (err) {
      clearInterval(progressUpdateTimer);
      Progress.popById('camera-cali-task');
      throw err; // Error while running test
    }
  }

  async doDiodeCalibrationCut() {
    const res = await fetch(DeviceConstants.DIODE_CALIBRATION);
    const blob = await res.blob();
    const vc = VersionChecker(this.currentDevice.info.version);
    if (vc.meetRequirement('RELOCATE_ORIGIN')) {
      await this.setOriginX(0);
      await this.setOriginY(0);
    }
    try {
      await this.go(blob);
    } catch {
      throw Error('UPLOAD_FAILED');
    }

    Progress.openSteppingProgress({ id: 'diode-cali-task', message: lang.diode_calibration.drawing_calibration_image });
    const taskTotalSecs = 35;
    let elapsedSecs = 0;
    const progressUpdateTimer = setInterval(() => {
      elapsedSecs += 0.1;
      if (elapsedSecs > taskTotalSecs) {
        clearInterval(progressUpdateTimer);
        return;
      }
      Progress.update('diode-cali-task', {
        percentage: (elapsedSecs / taskTotalSecs) * 100,
      });
    }, 100);

    try {
      await this.waitTillCompleted();
      clearInterval(progressUpdateTimer);
      Progress.popById('diode-cali-task');
    } catch (err) { // Error while running test
      clearInterval(progressUpdateTimer);
      Progress.popById('diode-cali-task');
      throw err;
    }
  }

  // fs functions
  ls(path: string) {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.ls, path);
  }

  lsusb() {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.lsusb);
  }

  fileInfo(path: string, fileName: string) {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.fileInfo, path, fileName);
  }

  deleteFile(path: string, fileName: string) {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.deleteFile, `${path}/${fileName}`);
  }

  async uploadToDirectory(
    data, path: string, fileName: string, onProgress?: (...args: any[]) => void,
  ) {
    const controlSocket = this.currentDevice.control;
    if (onProgress) {
      controlSocket.setProgressListen(onProgress);
    }
    const res = await controlSocket.addTask(controlSocket.upload, data, path, fileName);
    return res;
  }

  downloadFile(path: string, fileName: string, onProgress?: (...args: any[]) => void) {
    const controlSocket = this.currentDevice.control;
    if (onProgress) {
      controlSocket.setProgressListen(onProgress);
    }
    return controlSocket.addTask(controlSocket.downloadFile, `${path}/${fileName}`, onProgress);
  }

  downloadLog(log: string, onProgress: (...args: any[]) => void = () => { }) {
    const controlSocket = this.currentDevice.control;
    if (onProgress) {
      controlSocket.setProgressListen(onProgress);
    }
    return controlSocket.downloadLog(log);
  }

  async getLogsTexts(logs: string[], onProgress: (...args: any[]) => void = () => { }) {
    const res = {};
    for (let i = 0; i < logs.length; i += 1) {
      const log = logs[i];
      try {
        // eslint-disable-next-line no-await-in-loop
        const logFile = await this.downloadLog(log, onProgress);
        res[log] = logFile;
      } catch (e) {
        console.error(`Failed to get ${log}`, e);
      }
    }
    return res;
  }

  // Maintain mode functions
  async enterMaintainMode() {
    const controlSocket = this.currentDevice.control;
    const vc = VersionChecker(this.currentDevice.info.version);
    if (vc.meetRequirement('RELOCATE_ORIGIN')) {
      await this.setOriginX(0);
      await this.setOriginY(0);
    }
    return controlSocket.addTask(controlSocket.enterMaintainMode);
  }

  endMaintainMode() {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.endMaintainMode);
  }

  async maintainMove(args: { f: number, x: number, y: number }) {
    const controlSocket = this.currentDevice.control;
    const result = await controlSocket.addTask(controlSocket.maintainMove, args);
    if (result.status === 'ok') {
      return;
    }
    console.warn('maintainMove Result', result);
  }

  maintainHome() {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.maintainHome);
  }

  maintainCloseFan() {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.maintainCloseFan);
  }

  // Raw mode functions
  enterRawMode() {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.enterRawMode);
  }

  endRawMode() {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.endRawMode);
  }

  rawHome() {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.rawHome);
  }

  rawStartLineCheckMode() {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.rawStartLineCheckMode);
  }

  rawEndLineCheckMode() {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.rawEndLineCheckMode);
  }

  rawMove(args: { x: number, y: number, f: number }) {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.rawMove, args);
  }

  rawSetRotary(on: boolean) {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.rawSetRotary, on);
  }

  rawSetWaterPump(on: boolean) {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.rawSetWaterPump, on);
  }

  rawSetFan(on: boolean) {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.rawSetFan, on);
  }

  rawSetAirPump(on: boolean) {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.rawSetAirPump, on);
  }

  rawLooseMotor() {
    const controlSocket = this.currentDevice.control;
    const vc = VersionChecker(this.currentDevice.info.version);
    if (vc.meetRequirement('B34_LOOSE_MOTOR')) {
      return controlSocket.addTask(controlSocket.rawLooseMotorB34);
    }
    return controlSocket.addTask(controlSocket.rawLooseMotorB12);
  }

  // Get, Set functions
  getLaserPower() {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.getLaserPower);
  }

  setLaserPower(power: number) {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.setLaserPower, power);
  }

  setLaserPowerTemp(power: number) {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.setLaserPowerTemp, power);
  }

  getLaserSpeed() {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.getLaserSpeed);
  }

  setLaserSpeed(speed: number) {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.setLaserSpeed, speed);
  }

  setLaserSpeedTemp(speed: number) {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.setLaserSpeedTemp, speed);
  }

  getFan() {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.getFan);
  }

  setFan(fanSpeed: number) {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.setFan, fanSpeed);
  }

  setFanTemp(fanSpeed: number) {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.setFanTemp, fanSpeed);
  }

  setOriginX(x = 0) {
    const controlSocket = this.currentDevice.control;
    const vc = VersionChecker(this.currentDevice.info.version);
    if (vc.meetRequirement('RELOCATE_ORIGIN')) {
      return controlSocket.addTask(controlSocket.setOriginX, x);
    }
    console.warn('This device does not support command setOriginX');
    return null;
  }

  setOriginY(y = 0) {
    const controlSocket = this.currentDevice.control;
    const vc = VersionChecker(this.currentDevice.info.version);
    if (vc.meetRequirement('RELOCATE_ORIGIN')) {
      return controlSocket.addTask(controlSocket.setOriginY, y);
    }
    console.warn('This device does not support command setOriginY');
    return null;
  }

  async getDeviceSetting(name: string) {
    const { currentDevice } = this;
    const controlSocket = currentDevice.control;
    const res = await controlSocket.addTask(controlSocket.getDeviceSetting, name);

    if (currentDevice.cameraNeedsFlip === null && ['camera_offset', 'camera_offset_borderless'].includes(name)) {
      if (res.status === 'ok' && !currentDevice.info.model.includes('delta-')) {
        this.checkCameraNeedFlip(res.value);
      }
    }
    return res;
  }

  setDeviceSetting(name: string, value: string) {
    const controlSocket = this.currentDevice.control;
    if (value === 'delete') {
      return controlSocket.addTask(controlSocket.deleteDeviceSetting, name);
    }
    return controlSocket.addTask(controlSocket.setDeviceSetting, name, value);
  }

  getDeviceInfo() {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.deviceInfo);
  }

  async getReport() {
    const controlSocket = this.currentDevice.control;
    const result = await controlSocket.addTask(controlSocket.report);
    const s = result.device_status;
    // Force update st_label for a backend inconsistancy
    if (s.st_id === DeviceConstants.status.ABORTED) {
      s.st_label = 'ABORTED';
    }
    return s;
  }

  getPreviewInfo() {
    const controlSocket = this.currentDevice.control;
    return controlSocket.addTask(controlSocket.getPreview);
  }

  // update functions
  updateFirmware = (file: File, onProgress: (...args: any[]) => void) => {
    const controlSocket = this.currentDevice.control;
    if (onProgress) {
      controlSocket.setProgressListen(onProgress);
    }
    return controlSocket.addTask(controlSocket.fwUpdate, file);
  };

  updateToolhead = (file: File, onProgress: (...args: any[]) => void) => {
    const controlSocket = this.currentDevice.control;
    if (onProgress) {
      controlSocket.setProgressListen(onProgress);
    }
    return controlSocket.addTask(controlSocket.toolheadUpdate, file);
  };

  // Camera functions
  checkCameraNeedFlip(cameraOffset: string) {
    const { currentDevice } = this;
    currentDevice.cameraNeedsFlip = !!(Number((/F:\s?(-?\d+\.?\d+)/.exec(cameraOffset) || ['', ''])[1]));
    return currentDevice.cameraNeedsFlip;
  }

  async connectCamera(shouldCrop = true) {
    const { currentDevice } = this;
    if (currentDevice.cameraNeedsFlip === null && currentDevice.control && currentDevice.control.getMode() === '') {
      await this.getDeviceSetting('camera_offset');
    }
    currentDevice.camera = new Camera(shouldCrop, currentDevice.cameraNeedsFlip);
    await currentDevice.camera.createWs(currentDevice.info);
  }

  async takeOnePicture() {
    const res = await this.currentDevice.camera.oneShot();
    return res;
  }

  async streamCamera(shouldCrop = true) {
    await this.connectCamera(shouldCrop);

    // return an instance of RxJS Observable.
    return this.currentDevice.camera.getLiveStreamSource();
  }

  disconnectCamera() {
    if (this.currentDevice?.camera) {
      this.currentDevice.camera.closeWs();
      this.currentDevice.camera = null;
    }
  }

  getDeviceBySerial(serial: string, callback) {
    console.log(serial, this.discoveredDevices);
    const matchedDevice = this.discoveredDevices.filter((d) => d.serial === serial);

    if (matchedDevice.length > 0) {
      callback.onSuccess(matchedDevice[0]);
      return;
    }

    if (callback.timeout > 0) {
      setTimeout(() => {
        const newCallback = {
          ...callback,
          timeout: callback.timeout - 500,
        };
        this.getDeviceBySerial(serial, newCallback);
      }, 500);
    } else {
      callback.onTimeout();
    }
  }

  existDevice(serial: string) {
    return this.discoveredDevices.some((device) => device.serial === serial);
  }
}

const deviceMaster = new DeviceMaster();
// eslint-disable-next-line @typescript-eslint/dot-notation
window['deviceMaster'] = deviceMaster;
export default deviceMaster;
