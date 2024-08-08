/* eslint-disable no-console */
import { sprintf } from 'sprintf-js';

import Alert from 'app/actions/alert-caller';
import AlertConfig from 'helpers/api/alert-config';
import AlertConstants from 'app/constants/alert-constants';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import checkDeviceStatus from 'helpers/check-device-status';
import checkOldFirmware from 'helpers/device/checkOldFirmware';
import Constant from 'app/actions/beambox/constant';
import dialogCaller from 'app/actions/dialog-caller';
import deviceMaster from 'helpers/device-master';
import ErrorConstants from 'app/constants/error-constants';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import FisheyePreviewManagerV1 from 'app/actions/beambox/fisheye-preview-helpers/FisheyePreviewManagerV1';
import FisheyePreviewManagerV2 from 'app/actions/beambox/fisheye-preview-helpers/FisheyePreviewManagerV2';
import i18n from 'helpers/i18n';
import MessageCaller, { MessageLevel } from 'app/actions/message-caller';
import PreviewModeBackgroundDrawer from 'app/actions/beambox/preview-mode-background-drawer';
import Progress from 'app/actions/progress-caller';
import VersionChecker from 'helpers/version-checker';
import { CameraConfig, CameraParameters } from 'app/constants/camera-calibration-constants';
import {
  FisheyeCameraParameters,
  FisheyeCameraParametersV1,
  FisheyePreviewManager,
  RotationParameters3DCalibration,
} from 'interfaces/FisheyePreview';
import { getWorkarea, WorkAreaModel } from 'app/constants/workarea-constants';
import { IDeviceInfo } from 'interfaces/IDevice';
import { getSupportInfo } from 'app/constants/add-on';

const LANG = i18n.lang;
const canvasEventEmitter = eventEmitterFactory.createEventEmitter('canvas');

class PreviewModeController {
  isDrawing: boolean;

  originalSpeed: number;

  currentDevice: IDeviceInfo;

  isStarting: boolean;

  isPreviewModeOn: boolean;

  isPreviewBlocked: boolean;

  isLineCheckEnabled: boolean;

  cameraOffset: CameraParameters;

  fisheyePreviewManager: FisheyePreviewManager;

  lastPosition: number[];

  liveModeTimeOut: NodeJS.Timeout;

  errorCallback: () => void;

  camera3dRotaion: RotationParameters3DCalibration;

  constructor() {
    this.isDrawing = false;
    this.originalSpeed = 1;
    this.currentDevice = null;
    this.isPreviewModeOn = false;
    this.isPreviewBlocked = false;
    this.isLineCheckEnabled = true;
    this.cameraOffset = null;
    this.lastPosition = [0, 0]; // in mm
    this.errorCallback = () => {};
  }

  async setupBeamSeriesPreviewMode() {
    const device = this.currentDevice;
    await this.retrieveCameraOffset();

    Progress.update('preview-mode-controller', { message: LANG.message.gettingLaserSpeed });
    const laserSpeed = await deviceMaster.getLaserSpeed();

    if (Number(laserSpeed.value) !== 1) {
      this.originalSpeed = Number(laserSpeed.value);
      Progress.update('preview-mode-controller', { message: LANG.message.settingLaserSpeed });
      await deviceMaster.setLaserSpeed(1);
    }
    Progress.update('preview-mode-controller', { message: LANG.message.enteringRawMode });
    await deviceMaster.enterRawMode();
    Progress.update('preview-mode-controller', { message: LANG.message.exitingRotaryMode });
    await deviceMaster.rawSetRotary(false);
    Progress.update('preview-mode-controller', { message: LANG.message.homing });
    await deviceMaster.rawHome();
    const vc = VersionChecker(device.version);
    if (vc.meetRequirement('MAINTAIN_WITH_LINECHECK')) {
      await deviceMaster.rawStartLineCheckMode();
      this.isLineCheckEnabled = true;
    } else {
      this.isLineCheckEnabled = false;
    }
    Progress.update('preview-mode-controller', { message: LANG.message.turningOffFan });
    await deviceMaster.rawSetFan(false);
    Progress.update('preview-mode-controller', { message: LANG.message.turningOffAirPump });
    await deviceMaster.rawSetAirPump(false);
    await deviceMaster.rawSetWaterPump(false);
  }

  reloadHeightOffset = async () => {
    this.fisheyePreviewManager.reloadLevelingOffset();
  };

  editCamera3dRotation = async () => {
    if (!this.fisheyePreviewManager.support3dRotation) return;
    const handleApply = async (newParams: RotationParameters3DCalibration) => {
      if (this.fisheyePreviewManager.support3dRotation) {
        await this.fisheyePreviewManager?.update3DRotation(newParams);
        await this.previewFullWorkarea();
      }
    };

    const handleSave = async (newParams: RotationParameters3DCalibration) => {
      await handleApply(newParams);
      Progress.openNonstopProgress({
        id: 'saving-fisheye-3d',
        message: 'Saving fisheye 3d rotation',
      });
      try {
        await deviceMaster.updateFisheye3DRotation(newParams);
        if (newParams.tx !== 0 || newParams.ty !== 0) {
          const fisheyeParams = this.fisheyePreviewManager.params as FisheyeCameraParametersV1;
          const oldCenter = fisheyeParams.center || [0, 0];
          const newCenter = [oldCenter[0] + newParams.tx, oldCenter[1] + newParams.ty];
          const strData = JSON.stringify({ ...fisheyeParams, center: newCenter }, (key, val) => {
            if (typeof val === 'number') {
              return Math.round(val * 1e6) / 1e6;
            }
            return val;
          });
          await new Promise<void>((resolve) => setTimeout(() => resolve(), 3000));
          await deviceMaster.uploadFisheyeParams(strData, () => {});
        }
        Alert.popUp({ message: 'Saved Successfully!' });
      } catch (e) {
        console.error('Fail to save fisheye 3d rotation', e);
        Alert.popUpError({ message: 'Unable to save fisheye 3d rotation' });
      } finally {
        Progress.popById('saving-fisheye-3d');
      }
    };
    dialogCaller.showRotationParameters3DPanel({
      initParams: this.fisheyePreviewManager.rotationData,
      onApply: handleApply,
      onSave: handleSave,
    });
  };

  resetFishEyeObjectHeight = async () => {
    const res = await this.fisheyePreviewManager.resetObjectHeight();
    if (res && !PreviewModeBackgroundDrawer.isClean()) await this.previewFullWorkarea();
  };

  setUpFishEyePreviewMode = async () => {
    try {
      let params: FisheyeCameraParameters;
      try {
        params = await deviceMaster.fetchFisheyeParams();
      } catch (err) {
        console.log('Fail to fetchFisheyeParams', err?.message);
        throw new Error(
          'Unable to get fisheye parameters, please make sure you have calibrated the camera'
        );
      }
      const device = this.currentDevice;
      if (!('v' in params)) {
        this.fisheyePreviewManager = new FisheyePreviewManagerV1(device, params);
      } else if (params.v === 2) {
        this.fisheyePreviewManager = new FisheyePreviewManagerV2(device, params);
      }
      const res = await this.fisheyePreviewManager.setupFisheyePreview({
        progressId: 'preview-mode-controller',
      });
      return res;
    } finally {
      if (deviceMaster.currentControlMode === 'raw') {
        await deviceMaster.rawLooseMotor();
        Progress.update('preview-mode-controller', { message: LANG.message.endingRawMode });
        await deviceMaster.endRawMode();
      }
      Progress.popById('preview-mode-controller');
    }
  };

  async endBeamSeriesPreviewMode() {
    if (deviceMaster.currentControlMode !== 'raw') await deviceMaster.enterRawMode();
    if (this.isLineCheckEnabled) await deviceMaster.rawEndLineCheckMode();
    await deviceMaster.rawLooseMotor();
    await deviceMaster.endRawMode();
    if (this.originalSpeed !== 1) {
      await deviceMaster.setLaserSpeed(this.originalSpeed);
      this.originalSpeed = 1;
    }
  }

  async checkDevice(device: IDeviceInfo | null) {
    if (this.isStarting) return false;
    if (this.currentDevice && this.currentDevice.serial !== device?.serial) {
      await this.end();
      PreviewModeBackgroundDrawer.clear();
    }
    if (!device) return false;
    const deviceStatus = await checkDeviceStatus(device);
    if (!deviceStatus) return false;
    const vc = VersionChecker(device.version);
    if (!vc.meetRequirement('USABLE_VERSION')) {
      Alert.popUp({
        type: AlertConstants.SHOW_POPUP_ERROR,
        message: LANG.beambox.popup.should_update_firmware_to_continue,
      });
      Progress.popById('start-preview-controller');
      return false;
    }
    if (BeamboxPreference.read('borderless') && !vc.meetRequirement('BORDERLESS_MODE')) {
      // eslint-disable-next-line max-len
      const message = `#814 ${LANG.calibration.update_firmware_msg1} 2.5.1 ${LANG.calibration.update_firmware_msg2} ${LANG.beambox.popup.or_turn_off_borderless_mode}`;
      const caption = LANG.beambox.left_panel.borderless_preview;
      Alert.popUp({
        type: AlertConstants.SHOW_POPUP_ERROR,
        message,
        caption,
      });
      Progress.popById('start-preview-controller');
      return false;
    }
    const res = await checkOldFirmware(device.version);
    if (!res) return false;
    return true;
  }

  async start(device: IDeviceInfo, errCallback) {
    await this.reset();
    this.isStarting = true;

    const res = await deviceMaster.select(device);
    if (!res.success) {
      this.isStarting = false;
      return;
    }

    try {
      Progress.openNonstopProgress({
        id: 'preview-mode-controller',
        message: sprintf(LANG.message.connectingMachine, device.name),
      });
      this.currentDevice = device;
      if (!Constant.adorModels.includes(device.model)) await this.setupBeamSeriesPreviewMode();
      Progress.update('preview-mode-controller', { message: LANG.message.connectingCamera });
      await deviceMaster.connectCamera();
      if (Constant.adorModels.includes(device.model)) {
        const setUpRes = await this.setUpFishEyePreviewMode();
        if (!setUpRes) {
          this.isStarting = false;
          return;
        }
      }

      PreviewModeBackgroundDrawer.start(this.cameraOffset);
      PreviewModeBackgroundDrawer.drawBoundary();
      deviceMaster.setDeviceControlReconnectOnClose(device);
      this.errorCallback = errCallback;
      this.isPreviewModeOn = true;
      canvasEventEmitter.emit('UPDATE_CONTEXT');
    } catch (error) {
      console.error(error);
      this.reset();
      if (!Constant.adorModels.includes(device.model)) await this.endBeamSeriesPreviewMode();
      deviceMaster.kick();
      throw error;
    } finally {
      Progress.popById('preview-mode-controller');
      this.isStarting = false;
    }
  }

  async end() {
    console.log('end of pmc');
    this.isPreviewModeOn = false;
    if (this.liveModeTimeOut) clearTimeout(this.liveModeTimeOut);
    this.liveModeTimeOut = null;
    PreviewModeBackgroundDrawer.clearBoundary();
    PreviewModeBackgroundDrawer.end();
    const { currentDevice } = this;
    await this.reset();
    if (currentDevice) {
      deviceMaster.setDeviceControlDefaultCloseListener(currentDevice);
      const res = await deviceMaster.select(currentDevice);
      if (res.success) {
        if (!Constant.adorModels.includes(currentDevice.model))
          await this.endBeamSeriesPreviewMode();
        deviceMaster.kick();
      }
    }
  }

  isLiveModeOn = () => !!(this.isPreviewModeOn && this.liveModeTimeOut);

  toggleFullWorkareaLiveMode() {
    if (this.liveModeTimeOut) this.stopFullWorkareaLiveMode();
    else this.startFullWorkareaLiveMode();
  }

  startFullWorkareaLiveMode() {
    if (!this.isPreviewModeOn) return;
    const setNextTimeout = () => {
      this.liveModeTimeOut = setTimeout(() => {
        this.fullWorkareaLiveUpdate(() => {
          if (this.liveModeTimeOut) setNextTimeout();
        });
      }, 1000);
    };
    setNextTimeout();
  }

  stopFullWorkareaLiveMode() {
    if (this.liveModeTimeOut) clearTimeout(this.liveModeTimeOut);
    this.liveModeTimeOut = null;
  }

  async fullWorkareaLiveUpdate(callback = () => {}) {
    await this.reloadHeightOffset();
    await this.previewFullWorkarea(callback);
  }

  async previewFullWorkarea(callback = () => {}): Promise<boolean> {
    const { isPreviewBlocked } = this;
    if (isPreviewBlocked) return false;
    this.isDrawing = true;
    this.isPreviewBlocked = true;
    try {
      MessageCaller.openMessage({
        key: 'full-area-preview',
        content: i18n.lang.topbar.preview,
        level: MessageLevel.LOADING,
        duration: 20,
      });
      const imgUrl = await this.getPhotoFromMachine();
      PreviewModeBackgroundDrawer.drawFullWorkarea(imgUrl, callback);
      this.isPreviewBlocked = false;
      this.isDrawing = false;
      MessageCaller.openMessage({
        key: 'full-area-preview',
        level: MessageLevel.SUCCESS,
        content: 'Successfully previewed',
        duration: 3,
      });
      return true;
    } catch (error) {
      if (this.isPreviewModeOn) {
        console.log(error);
        Alert.popUp({
          type: AlertConstants.SHOW_POPUP_ERROR,
          message: error.message || error.text,
        });
      }
      if (!PreviewModeBackgroundDrawer.isClean()) this.isDrawing = false;
      this.end();
      callback();
      return false;
    }
  }

  async preview(
    x: number,
    y: number,
    opts: {
      last?: boolean;
      callback?: () => void;
      overlapRatio?: number;
    } = {}
  ): Promise<boolean> {
    const { isPreviewBlocked, isPreviewModeOn, currentDevice } = this;
    if (isPreviewBlocked || !isPreviewModeOn) return false;
    const { callback = () => {}, last = false } = opts;
    if (Constant.adorModels.includes(currentDevice?.model)) {
      const res = await this.previewFullWorkarea(callback);
      return res;
    }
    this.isDrawing = true;
    this.isPreviewBlocked = true;
    const workarea = document.querySelector('#workarea') as HTMLElement;
    workarea.style.cursor = 'wait';
    try {
      const constrainedXY = this.constrainPreviewXY(x, y);
      const { x: newX, y: newY } = constrainedXY;
      const imgUrl = await this.getPhotoAfterMove(newX, newY);
      PreviewModeBackgroundDrawer.draw(imgUrl, newX, newY, opts);
      workarea.style.cursor = 'url(img/camera-cursor.svg), cell';
      this.isPreviewBlocked = false;
      if (last) this.isDrawing = false;
      return true;
    } catch (error) {
      if (this.isPreviewModeOn) {
        console.log(error);
        Alert.popUp({
          type: AlertConstants.SHOW_POPUP_ERROR,
          message: error.message || error.text,
        });
      }
      workarea.style.cursor = 'auto';
      if (!PreviewModeBackgroundDrawer.isClean()) {
        this.isDrawing = false;
      }
      this.end();
      callback();
      return false;
    }
  }

  async previewRegion(x1, y1, x2, y2, opts: { callback?: () => void; overlapRatio?: number } = {}) {
    const { callback = () => {}, overlapRatio = 0.05 } = opts;
    const points = (() => {
      const size = (() => {
        const h = Constant.camera.imgHeight;
        const a = this.getCameraOffset().angle;
        const s = this.getCameraOffset().scaleRatioY;
        const c = h / (Math.cos(a) + Math.sin(a));
        // overlap a little bit to fix empty area between pictures
        // (some machine will have it, maybe due to cameraOffset.angle).
        // it seems like something wrong handling image rotation.
        return c * s;
      })();

      const { left, right, top, bottom } = (() => {
        const l = Math.min(x1, x2) + size / 2;
        const r = Math.max(x1, x2) - size / 2;
        const t = Math.min(y1, y2) + size / 2;
        const b = Math.max(y1, y2) - size / 2;

        return {
          left: this.constrainPreviewXY(l, 0).x,
          right: this.constrainPreviewXY(r, 0).x,
          top: this.constrainPreviewXY(0, t).y,
          bottom: this.constrainPreviewXY(0, b).y,
        };
      })();

      let pointsArray = [];
      let shouldRowReverse = false; // let camera 走Ｓ字型
      const step = (1 - overlapRatio) * size;
      for (let curY = top; curY < bottom + size; curY += step) {
        const row = [];
        for (let curX = left; curX < right + size; curX += step) {
          row.push([curX, curY]);
        }

        if (shouldRowReverse) {
          row.reverse();
        }
        pointsArray = pointsArray.concat(row);
        shouldRowReverse = !shouldRowReverse;
      }
      return pointsArray;
    })();

    for (let i = 0; i < points.length; i += 1) {
      MessageCaller.openMessage({
        key: 'camera-preview',
        content: `${i18n.lang.topbar.preview} ${i}/${points.length}`,
        level: MessageLevel.LOADING,
        duration: 20,
      });
      // eslint-disable-next-line no-await-in-loop
      const result = await this.preview(points[i][0], points[i][1], {
        last: i === points.length - 1,
        overlapRatio,
      });

      if (!result) {
        this.isDrawing = false;
        return;
      }
    }
    MessageCaller.openMessage({
      key: 'camera-preview',
      level: MessageLevel.SUCCESS,
      content: i18n.lang.device.completed,
      duration: 3,
    });
    callback();
  }

  isPreviewMode() {
    return this.isPreviewModeOn;
  }

  getCameraOffset(): CameraParameters {
    return this.cameraOffset;
  }

  getCameraOffsetStandard(): CameraConfig {
    return {
      X: this.cameraOffset.x,
      Y: this.cameraOffset.y,
      R: this.cameraOffset.angle,
      SX: this.cameraOffset.scaleRatioX,
      SY: this.cameraOffset.scaleRatioY,
    };
  }

  // helper functions

  async retrieveCameraOffset() {
    // End linecheck mode if needed
    try {
      if (this.isLineCheckEnabled) {
        Progress.update('preview-mode-controller', { message: LANG.message.endingLineCheckMode });
        await deviceMaster.rawEndLineCheckMode();
      }
    } catch (error) {
      if (error.message === ErrorConstants.CONTROL_SOCKET_MODE_ERROR) {
        // Device control is not in raw mode
      } else if (
        error.status === 'error' &&
        error.error &&
        error.error[0] === 'L_UNKNOWN_COMMAND'
      ) {
        // Ghost control socket is not in raw mode, unknown command M172
      } else {
        console.log('Unable to end line check mode', error);
      }
    }
    // cannot getDeviceSetting during RawMode. So we force to end it.
    try {
      Progress.update('preview-mode-controller', { message: LANG.message.endingRawMode });
      await deviceMaster.endRawMode();
    } catch (error) {
      if (error.status === 'error' && error.error && error.error[0] === 'OPERATION_ERROR') {
        // do nothing.
        console.log('Not in raw mode right now');
      } else if (error.status === 'error' && error.error === 'TIMEOUT') {
        console.log('Timeout has occur when end raw mode, reconnecting');
        await deviceMaster.reconnect();
      } else {
        console.log(error);
      }
    }
    const borderless = BeamboxPreference.read('borderless') || false;
    const supportOpenBottom = getSupportInfo(BeamboxPreference.read('workarea')).openBottom;
    const configName =
      supportOpenBottom && borderless ? 'camera_offset_borderless' : 'camera_offset';

    Progress.update('preview-mode-controller', { message: LANG.message.retrievingCameraOffset });
    const resp = await deviceMaster.getDeviceSetting(configName);
    console.log(`Reading ${configName}\nResp = ${resp.value}`);
    resp.value = ` ${resp.value}`;
    this.cameraOffset = {
      x: Number(/ X:\s?(-?\d+\.?\d+)/.exec(resp.value)[1]),
      y: Number(/ Y:\s?(-?\d+\.?\d+)/.exec(resp.value)[1]),
      angle: Number(/R:\s?(-?\d+\.?\d+)/.exec(resp.value)[1]),
      scaleRatioX: Number(
        (/SX:\s?(-?\d+\.?\d+)/.exec(resp.value) || /S:\s?(-?\d+\.?\d+)/.exec(resp.value))[1]
      ),
      scaleRatioY: Number(
        (/SY:\s?(-?\d+\.?\d+)/.exec(resp.value) || /S:\s?(-?\d+\.?\d+)/.exec(resp.value))[1]
      ),
    };
    if (this.cameraOffset.x === 0 && this.cameraOffset.y === 0) {
      this.cameraOffset = {
        x: Constant.camera.offsetX_ideal,
        y: Constant.camera.offsetY_ideal,
        angle: 0,
        scaleRatioX: Constant.camera.scaleRatio_ideal,
        scaleRatioY: Constant.camera.scaleRatio_ideal,
      };
    }
    console.log(`Got ${configName}`, this.cameraOffset);
  }

  async reset() {
    this.currentDevice = null;
    this.isPreviewModeOn = false;
    this.isPreviewBlocked = false;
    this.cameraOffset = null;
    this.lastPosition = [0, 0];
    deviceMaster.disconnectCamera();
  }

  constrainPreviewXY(x, y) {
    const workarea = BeamboxPreference.read('workarea') as WorkAreaModel;
    const { pxWidth: width, pxHeight, pxDisplayHeight } = getWorkarea(workarea);
    const height = pxDisplayHeight ?? pxHeight;
    const isDiodeEnabled =
      BeamboxPreference.read('enable-diode') && getSupportInfo(workarea).hybridLaser;
    const isBorderlessEnabled = BeamboxPreference.read('borderless');
    let maxWidth = width;
    let maxHeight = height;
    if (isDiodeEnabled) {
      maxWidth -= Constant.diode.safeDistance.X * Constant.dpmm;
      maxHeight -= Constant.diode.safeDistance.Y * Constant.dpmm;
    } else if (isBorderlessEnabled) {
      maxWidth -= Constant.borderless.safeDistance.X * Constant.dpmm;
    }
    const newX = Math.min(Math.max(x, this.getCameraOffset().x * Constant.dpmm), maxWidth);
    const newY = Math.min(Math.max(y, this.getCameraOffset().y * Constant.dpmm), maxHeight);
    return {
      x: newX,
      y: newY,
    };
  }

  // x, y in pixel
  getPhotoAfterMove(x, y) {
    const movementX = x / Constant.dpmm - this.getCameraOffset().x;
    const movementY = y / Constant.dpmm - this.getCameraOffset().y;

    return this.getPhotoAfterMoveTo(movementX, movementY);
  }

  // movementX, movementY in mm
  async getPhotoAfterMoveTo(movementX, movementY) {
    let feedrate = Math.min(Constant.camera.movementSpeed.x, Constant.camera.movementSpeed.y);
    const movement = {
      f: feedrate,
      x: movementX, // mm
      y: movementY, // mm
    };
    if (
      BeamboxPreference.read('enable-diode') &&
      getSupportInfo(BeamboxPreference.read('workarea')).hybridLaser
    ) {
      if (BeamboxPreference.read('preview_movement_speed_hl')) {
        feedrate = BeamboxPreference.read('preview_movement_speed_hl');
      } else {
        feedrate *= 0.6;
      }
    } else if (BeamboxPreference.read('preview_movement_speed')) {
      feedrate = BeamboxPreference.read('preview_movement_speed');
    }
    movement.f = feedrate; // firmware will used limited x, y speed still

    const selectRes = await deviceMaster.select(this.currentDevice);
    if (!selectRes.success) {
      return null;
    }
    const control = await deviceMaster.getControl();
    if (control.getMode() !== 'raw') await deviceMaster.enterRawMode();
    await deviceMaster.rawMove(movement);
    await this.waitUntilEstimatedMovementTime(movementX, movementY);

    const imgUrl = await this.getPhotoFromMachine();

    return imgUrl;
  }

  // movementX, movementY in mm
  async waitUntilEstimatedMovementTime(movementX, movementY) {
    let feedrate = Math.min(Constant.camera.movementSpeed.x, Constant.camera.movementSpeed.y);

    if (
      BeamboxPreference.read('enable-diode') &&
      getSupportInfo(BeamboxPreference.read('workarea')).hybridLaser
    ) {
      if (BeamboxPreference.read('preview_movement_speed_hl')) {
        feedrate = BeamboxPreference.read('preview_movement_speed_hl');
      } else {
        feedrate *= 0.6;
      }
    } else if (BeamboxPreference.read('preview_movement_speed')) {
      feedrate = BeamboxPreference.read('preview_movement_speed');
    }
    const moveDist = Math.hypot(this.lastPosition[0] - movementX, this.lastPosition[1] - movementY);
    let timeToWait = moveDist / feedrate;
    timeToWait *= 60000; // min => ms
    // wait for moving camera to take a stable picture, this value need to be optimized
    timeToWait *= 1.2;
    timeToWait += 100;
    this.lastPosition = [movementX, movementY];
    await new Promise((resolve) => setTimeout(() => resolve(null), timeToWait));
  }

  // just for getPhotoAfterMoveTo()
  async getPhotoFromMachine() {
    const { imgBlob, needCameraCableAlert } = (await deviceMaster.takeOnePicture()) ?? {};
    if (!imgBlob) {
      throw new Error(LANG.message.camera.ws_closed_unexpectly);
    } else if (needCameraCableAlert && !AlertConfig.read('skip_camera_cable_alert')) {
      const shouldContinue = await new Promise<boolean>((resolve) => {
        Alert.popUp({
          id: 'camera_cable_alert',
          message: LANG.message.camera.camera_cable_unstable,
          type: AlertConstants.SHOW_POPUP_WARNING,
          checkbox: {
            text: LANG.beambox.popup.dont_show_again,
            callbacks: () => AlertConfig.write('skip_camera_cable_alert', true),
          },
          buttonLabels: [LANG.message.camera.abort_preview, LANG.message.camera.continue_preview],
          callbacks: [() => resolve(false), () => resolve(true)],
          primaryButtonIndex: 1,
        });
      });
      if (!shouldContinue) {
        this.end();
        return null;
      }
    }
    const imgUrl = URL.createObjectURL(imgBlob);
    return imgUrl;
  }
}

const instance = new PreviewModeController();

export default instance;
