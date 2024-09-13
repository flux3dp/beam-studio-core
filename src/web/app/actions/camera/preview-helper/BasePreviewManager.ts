/* eslint-disable @typescript-eslint/no-unused-vars */
import alertCaller from 'app/actions/alert-caller';
import alertConfig from 'helpers/api/alert-config';
import alertConstants from 'app/constants/alert-constants';
import beamboxPreference from 'app/actions/beambox/beambox-preference';
import constant from 'app/actions/beambox/constant';
import deviceMaster from 'helpers/device-master';
import i18n from 'helpers/i18n';
import { getSupportInfo } from 'app/constants/add-on';
import { getWorkarea, WorkAreaModel } from 'app/constants/workarea-constants';
import { IDeviceInfo } from 'interfaces/IDevice';
import { PreviewManager } from 'interfaces/PreviewManager';

// TODO: Add tests
class BasePreviewManager implements PreviewManager {
  protected device: IDeviceInfo;
  protected progressId: string;
  protected workarea: WorkAreaModel;
  protected ended = false;
  private lastPosition: [number, number] = [0, 0];

  constructor(device: IDeviceInfo) {
    this.device = device;
    // or use device.model?
    this.workarea = beamboxPreference.read('workarea');
  }

  public setup = async (): Promise<boolean> => {
    throw new Error('Method not implemented.');
  };

  public end = async (): Promise<void> => {
    this.ended = true;
    try {
      const res = await deviceMaster.select(this.device);
      deviceMaster.disconnectCamera();
      if (res.success) deviceMaster.kick();
    } catch (error) {
      console.error('Failed to end PreviewManager', error);
    }
  };

  public preview = async (x: number, y: number): Promise<boolean> => {
    throw new Error('Method not implemented.');
  };

  public previewRegion = async (
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): Promise<boolean> => {
    throw new Error('Method not implemented.');
  };

  /**
   * constrain the preview area
   * @param x x in px
   * @param y y in px
   */
  constrainPreviewXY = (x: number, y: number): { x: number; y: number } => {
    const { pxWidth: width, pxHeight, pxDisplayHeight } = getWorkarea(this.workarea);
    const height = pxDisplayHeight ?? pxHeight;
    const newX = Math.min(Math.max(x, 0), width);
    const newY = Math.min(Math.max(y, 0), height);
    return {
      x: newX,
      y: newY,
    };
  };

  /**
   * getPhotoAfterMoveTo
   * @param movementX x in mm
   * @param movementY y in mm
   * @returns image blob url of the photo taken
   */
  async getPhotoAfterMoveTo(movementX: number, movementY: number): Promise<string> {
    let feedrate = Math.min(constant.camera.movementSpeed.x, constant.camera.movementSpeed.y);
    const movement = { f: feedrate, x: movementX, y: movementY };
    if (
      beamboxPreference.read('enable-diode') &&
      getSupportInfo(beamboxPreference.read('workarea')).hybridLaser
    ) {
      if (beamboxPreference.read('preview_movement_speed_hl')) {
        feedrate = beamboxPreference.read('preview_movement_speed_hl');
      } else feedrate *= 0.6;
    } else if (beamboxPreference.read('preview_movement_speed')) {
      feedrate = beamboxPreference.read('preview_movement_speed');
    }
    movement.f = feedrate; // firmware will used limited x, y speed still

    const selectRes = await deviceMaster.select(this.device);
    if (!selectRes.success) return null;
    const control = await deviceMaster.getControl();
    if (control.getMode() !== 'raw') await deviceMaster.enterRawMode();
    await deviceMaster.rawMove(movement);
    await this.waitUntilEstimatedMovementTime(movementX, movementY);

    const imgUrl = await this.getPhotoFromMachine();
    return imgUrl;
  }

  /**
   * Use raw command to move the camera to the target position
   * and wait an estimated time for the camera to take a stable picture
   * @param movementX
   * @param movementY
   */
  async waitUntilEstimatedMovementTime(movementX: number, movementY: number): Promise<void> {
    let feedrate = Math.min(constant.camera.movementSpeed.x, constant.camera.movementSpeed.y);

    if (beamboxPreference.read('enable-diode') && getSupportInfo(this.workarea).hybridLaser) {
      if (beamboxPreference.read('preview_movement_speed_hl')) {
        feedrate = beamboxPreference.read('preview_movement_speed_hl');
      } else {
        feedrate *= 0.6;
      }
    } else if (beamboxPreference.read('preview_movement_speed')) {
      feedrate = beamboxPreference.read('preview_movement_speed');
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

  async getPhotoFromMachine(): Promise<string> {
    const { lang } = i18n;
    const { imgBlob, needCameraCableAlert } = (await deviceMaster.takeOnePicture()) ?? {};
    if (!imgBlob) {
      throw new Error(lang.message.camera.ws_closed_unexpectly);
    } else if (needCameraCableAlert && !alertConfig.read('skip_camera_cable_alert')) {
      const shouldContinue = await new Promise<boolean>((resolve) => {
        alertCaller.popUp({
          id: 'camera_cable_alert',
          message: lang.message.camera.camera_cable_unstable,
          type: alertConstants.SHOW_POPUP_WARNING,
          checkbox: {
            text: lang.beambox.popup.dont_show_again,
            callbacks: () => alertConfig.write('skip_camera_cable_alert', true),
          },
          buttonLabels: [lang.message.camera.abort_preview, lang.message.camera.continue_preview],
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

export default BasePreviewManager;
