/* eslint-disable no-console */
import { sprintf } from 'sprintf-js';

import Alert from 'app/actions/alert-caller';
import AlertConfig from 'helpers/api/alert-config';
import AlertConstants from 'app/constants/alert-constants';
import BeamboxPreference from 'app/actions/beambox/beambox-preference';
import checkDeviceStatus from 'helpers/check-device-status';
import checkOldFirmware from 'helpers/device/checkOldFirmware';
import Constant, { WorkAreaModel } from 'app/actions/beambox/constant';
import dialogCaller from 'app/actions/dialog-caller';
import deviceConstants from 'app/constants/device-constants';
import deviceMaster from 'helpers/device-master';
import ErrorConstants from 'app/constants/error-constants';
import i18n from 'helpers/i18n';
import MessageCaller, { MessageLevel } from 'app/actions/message-caller';
import PreviewModeBackgroundDrawer from 'app/actions/beambox/preview-mode-background-drawer';
import Progress from 'app/actions/progress-caller';
import VersionChecker from 'helpers/version-checker';
import { CameraConfig, CameraParameters, FisheyeCameraParameters } from 'app/constants/camera-calibration-constants';
import { IDeviceInfo } from 'interfaces/IDevice';
import { interpolatePointsFromHeight } from 'helpers/camera-calibration-helper';

const { $ } = window;
const LANG = i18n.lang;

class PreviewModeController {
  isDrawing: boolean;

  originalSpeed: number;

  currentDevice: IDeviceInfo;

  isPreviewModeOn: boolean;

  isPreviewBlocked: boolean;

  isLineCheckEnabled: boolean;

  cameraOffset: CameraParameters;

  fisheyeParameters: FisheyeCameraParameters;

  lastPosition: number[];

  errorCallback: () => void;

  constructor() {
    this.isDrawing = false;
    this.originalSpeed = 1;
    this.currentDevice = null;
    this.isPreviewModeOn = false;
    this.isPreviewBlocked = false;
    this.isLineCheckEnabled = true;
    this.cameraOffset = null;
    this.fisheyeParameters = null;
    this.lastPosition = [0, 0]; // in mm
    this.errorCallback = () => {};
  }

  async setupBeamSeriesPreviewMode() {
    const device = this.currentDevice;
    await this.retrieveCameraOffset();

    Progress.update('start-preview-mode', { message: LANG.message.gettingLaserSpeed });
    const laserSpeed = await deviceMaster.getLaserSpeed();

    if (Number(laserSpeed.value) !== 1) {
      this.originalSpeed = Number(laserSpeed.value);
      Progress.update('start-preview-mode', { message: LANG.message.settingLaserSpeed });
      await deviceMaster.setLaserSpeed(1);
    }
    Progress.update('start-preview-mode', { message: LANG.message.enteringRawMode });
    await deviceMaster.enterRawMode();
    Progress.update('start-preview-mode', { message: LANG.message.exitingRotaryMode });
    await deviceMaster.rawSetRotary(false);
    Progress.update('start-preview-mode', { message: LANG.message.homing });
    await deviceMaster.rawHome();
    const vc = VersionChecker(device.version);
    if (vc.meetRequirement('MAINTAIN_WITH_LINECHECK')) {
      await deviceMaster.rawStartLineCheckMode();
      this.isLineCheckEnabled = true;
    } else {
      this.isLineCheckEnabled = false;
    }
    Progress.update('start-preview-mode', { message: LANG.message.turningOffFan });
    await deviceMaster.rawSetFan(false);
    Progress.update('start-preview-mode', { message: LANG.message.turningOffAirPump });
    await deviceMaster.rawSetAirPump(false);
    await deviceMaster.rawSetWaterPump(false);
  }

  getHeight = async () => {
    const device = this.currentDevice;
    let enteredRawMode = false;
    try {
      if (!BeamboxPreference.read('enable-custom-preview-height')) {
        Progress.openNonstopProgress({
          id: 'preview-mode-get-height',
          message: LANG.message.enteringRawMode,
          timeout: 30000,
        });
        await deviceMaster.enterRawMode();
        enteredRawMode = true;
        Progress.update('preview-mode-get-height', { message: 'tGetting probe position' });
        const res = await deviceMaster.rawGetProbePos();
        const { z, didAf } = res;
        if (didAf) return deviceConstants.WORKAREA_DEEP[device.model] - z;
      }
    } catch (e) {
      // do nothing
    } finally {
      Progress.update('preview-mode-get-height', { message: LANG.message.endingRawMode });
      if (enteredRawMode) await deviceMaster.endRawMode();
      Progress.popById('preview-mode-get-height');
    }
    const val = await dialogCaller.getPromptValue({ message: 'tPlease enter the height of object (mm)' });
    // Get value from machine
    const heightOffset = 1.8;
    console.log('Useing height offset: ', heightOffset);
    return val !== null ? (Number(val) + heightOffset) : null;
  };

  setFishEyeObjectHeight = async () => {
    const { k, d, heights, center, points } = this.fisheyeParameters;
    const height = await this.getHeight();
    console.log('Use Height: ', height);
    let perspectivePoints = points[0];
    if (height !== null && !Number.isNaN(height)) {
      perspectivePoints = interpolatePointsFromHeight(height, heights, points);
      console.log(height, perspectivePoints);
    }
    await deviceMaster.setFisheyeMatrix({ k, d, center, points: perspectivePoints }, true);
  };

  setUpFishEyePreviewMode = async () => {
    let fisheyeParameters: FisheyeCameraParameters = null;
    try {
      fisheyeParameters = await deviceMaster.fetchFisheyeParams();
    } catch (err) {
      throw new Error('Unable to get fisheye parameters, please make sure you have calibrated the camera');
    }
    this.fisheyeParameters = fisheyeParameters;
    await this.setFishEyeObjectHeight();
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
      const message = `#814 ${LANG.camera_calibration.update_firmware_msg1} 2.5.1 ${LANG.camera_calibration.update_firmware_msg2} ${LANG.beambox.popup.or_turn_off_borderless_mode}`;
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

  async start(device, errCallback) {
    await this.reset();

    const res = await deviceMaster.select(device);
    if (!res.success) {
      return;
    }

    try {
      Progress.openNonstopProgress({
        id: 'start-preview-mode',
        message: sprintf(LANG.message.connectingMachine, device.name),
        timeout: 30000,
      });
      this.currentDevice = device;
      if (device.model !== 'fad1') await this.setupBeamSeriesPreviewMode();
      Progress.update('start-preview-mode', { message: LANG.message.connectingCamera });
      await deviceMaster.connectCamera();
      if (device.model === 'fad1') await this.setUpFishEyePreviewMode();

      PreviewModeBackgroundDrawer.start(this.cameraOffset);
      PreviewModeBackgroundDrawer.drawBoundary();
      deviceMaster.setDeviceControlReconnectOnClose(device);
      this.errorCallback = errCallback;
      this.isPreviewModeOn = true;
    } catch (error) {
      console.error(error);
      if (device.model !== 'fad1') await this.endBeamSeriesPreviewMode();
      deviceMaster.kick();
      throw error;
    } finally {
      Progress.popById('start-preview-mode');
    }
  }

  async end() {
    console.log('end of pmc');
    this.isPreviewModeOn = false;
    PreviewModeBackgroundDrawer.clearBoundary();
    PreviewModeBackgroundDrawer.end();
    const { currentDevice } = this;
    await this.reset();
    if (currentDevice) {
      deviceMaster.setDeviceControlDefaultCloseListener(currentDevice);
      const res = await deviceMaster.select(currentDevice);
      if (res.success) {
        if (currentDevice.model !== 'fad1') await this.endBeamSeriesPreviewMode();
        deviceMaster.kick();
      }
    }
  }

  async previewFullWorkarea(callback = () => { }): Promise<boolean> {
    const { currentDevice, isPreviewBlocked } = this;
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
      PreviewModeBackgroundDrawer.drawFullWorkarea(imgUrl, currentDevice.model as WorkAreaModel, callback);
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

  async preview(x, y, last = false, callback = () => { }): Promise<boolean> {
    const { isPreviewBlocked, currentDevice } = this;
    if (isPreviewBlocked) return false;
    if (currentDevice.model === 'fad1') {
      const res = await this.previewFullWorkarea(callback);
      return res;
    }
    this.isDrawing = true;
    this.isPreviewBlocked = true;

    $('#workarea').css('cursor', 'wait');
    try {
      const constrainedXY = this.constrainPreviewXY(x, y);
      const { x: newX, y: newY } = constrainedXY;
      const imgUrl = await this.getPhotoAfterMove(newX, newY);
      PreviewModeBackgroundDrawer.draw(imgUrl, newX, newY, last, callback);

      $('#workarea').css('cursor', 'url(img/camera-cursor.svg), cell');
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
      $('#workarea').css('cursor', 'auto');
      if (!PreviewModeBackgroundDrawer.isClean()) {
        this.isDrawing = false;
      }
      this.end();
      callback();
      return false;
    }
  }

  async previewRegion(x1, y1, x2, y2, callback = () => { }) {
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

      const {
        left, right, top, bottom,
      } = (() => {
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
      const step = 0.95 * size;
      for (let curY = top; curY < (bottom + size); curY += step) {
        const row = [];
        for (let curX = left; curX < (right + size); curX += step) {
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
      const result = await this.preview(points[i][0], points[i][1], (i === points.length - 1));

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

  // x, y in mm
  takePictureAfterMoveTo(movementX, movementY) {
    return this.getPhotoAfterMoveTo(movementX, movementY);
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
        Progress.update('start-preview-mode', { message: LANG.message.endingLineCheckMode });
        await deviceMaster.rawEndLineCheckMode();
      }
    } catch (error) {
      if (error.message === ErrorConstants.CONTROL_SOCKET_MODE_ERROR) {
        // Device control is not in raw mode
      } else if ((error.status === 'error') && (error.error && error.error[0] === 'L_UNKNOWN_COMMAND')) {
        // Ghost control socket is not in raw mode, unknown command M172
      } else {
        console.log('Unable to end line check mode', error);
      }
    }
    // cannot getDeviceSetting during RawMode. So we force to end it.
    try {
      Progress.update('start-preview-mode', { message: LANG.message.endingRawMode });
      await deviceMaster.endRawMode();
    } catch (error) {
      if (error.status === 'error' && (error.error && error.error[0] === 'OPERATION_ERROR')) {
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
    const supportOpenBottom = Constant.addonsSupportList.openBottom.includes(BeamboxPreference.read('workarea'));
    const configName = (supportOpenBottom && borderless) ? 'camera_offset_borderless' : 'camera_offset';

    Progress.update('start-preview-mode', { message: LANG.message.retrievingCameraOffset });
    const resp = await deviceMaster.getDeviceSetting(configName);
    console.log(`Reading ${configName}\nResp = ${resp.value}`);
    resp.value = ` ${resp.value}`;
    this.cameraOffset = {
      x: Number(/ X:\s?(-?\d+\.?\d+)/.exec(resp.value)[1]),
      y: Number(/ Y:\s?(-?\d+\.?\d+)/.exec(resp.value)[1]),
      angle: Number(/R:\s?(-?\d+\.?\d+)/.exec(resp.value)[1]),
      scaleRatioX: Number((/SX:\s?(-?\d+\.?\d+)/.exec(resp.value) || /S:\s?(-?\d+\.?\d+)/.exec(resp.value))[1]),
      scaleRatioY: Number((/SY:\s?(-?\d+\.?\d+)/.exec(resp.value) || /S:\s?(-?\d+\.?\d+)/.exec(resp.value))[1]),
    };
    if ((this.cameraOffset.x === 0) && (this.cameraOffset.y === 0)) {
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
    const workarea = BeamboxPreference.read('workarea');
    const isDiodeEnabled = BeamboxPreference.read('enable-diode')
      && Constant.addonsSupportList.hybridLaser.includes(workarea);
    const isBorderlessEnabled = BeamboxPreference.read('borderless');
    let maxWidth = Constant.dimension.getWidth(workarea);
    let maxHeight = Constant.dimension.getHeight(workarea);
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
      BeamboxPreference.read('enable-diode')
      && Constant.addonsSupportList.hybridLaser.includes(BeamboxPreference.read('workarea'))
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
    const moveRes = await deviceMaster.rawMove(movement);
    if (moveRes) {
      console.log('Preview raw move respond: ', moveRes.text);
    }
    await this.waitUntilEstimatedMovementTime(movementX, movementY);

    const imgUrl = await this.getPhotoFromMachine();

    return imgUrl;
  }

  // movementX, movementY in mm
  async waitUntilEstimatedMovementTime(movementX, movementY) {
    let feedrate = Math.min(Constant.camera.movementSpeed.x, Constant.camera.movementSpeed.y);

    if (
      BeamboxPreference.read('enable-diode')
      && Constant.addonsSupportList.hybridLaser.includes(BeamboxPreference.read('workarea'))
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
    const { imgBlob, needCameraCableAlert } = await deviceMaster.takeOnePicture() ?? {};
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
          callbacks: [
            () => resolve(false),
            () => resolve(true),
          ],
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
