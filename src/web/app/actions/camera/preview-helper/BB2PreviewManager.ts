import { sprintf } from 'sprintf-js';

import alertCaller from 'app/actions/alert-caller';
import constant from 'app/actions/beambox/constant';
import deviceMaster from 'helpers/device-master';
import i18n from 'helpers/i18n';
import MessageCaller, { MessageLevel } from 'app/actions/message-caller';
import PreviewModeBackgroundDrawer from 'app/actions/beambox/preview-mode-background-drawer';
import progressCaller from 'app/actions/progress-caller';
import { FisheyeCameraParameters, PerspectiveGrid } from 'interfaces/FisheyePreview';
import { getWorkarea } from 'app/constants/workarea-constants';
import { IDeviceInfo } from 'interfaces/IDevice';
import { PreviewManager } from 'interfaces/PreviewManager';

import BasePreviewManager from './BasePreviewManager';

// TODO: Add tests
class BB2PreviewManager extends BasePreviewManager implements PreviewManager {
  private lineCheckEnabled: boolean;

  private originalSpeed: number;

  private fisheyeParams: FisheyeCameraParameters;

  private cameraPpmm = 5;

  private previewPpmm = 10;

  private grid: PerspectiveGrid = {
    x: [-80, 80, 10],
    y: [0, 100, 10],
  };

  private cameraCenterOffset: { x: number; y: number };

  constructor(device: IDeviceInfo) {
    super(device);
    this.progressId = 'beam-preview-manager';
    this.cameraCenterOffset = {
      x: this.grid.x[0] + (this.grid.x[1] - this.grid.x[0]) / 2,
      y: this.grid.y[0] + (this.grid.y[1] - this.grid.y[0]) / 2,
    };
  }

  public setup = async (args?: { progressId?: string }): Promise<boolean> => {
    const { lang } = i18n;
    const { progressId } = args || {};
    if (progressId) this.progressId = progressId;
    try {
      progressCaller.openNonstopProgress({
        id: this.progressId,
        message: sprintf(lang.message.connectingMachine, this.device.name),
      });
      try {
        this.fisheyeParams = await deviceMaster.fetchFisheyeParams();
      } catch (err) {
        console.log('Fail to fetchFisheyeParams', err?.message);
        throw new Error(
          'Unable to get fisheye parameters, please make sure you have calibrated the camera'
        );
      }
      progressCaller.update(this.progressId, { message: lang.message.gettingLaserSpeed });
      const laserSpeed = await deviceMaster.getLaserSpeed();

      if (Number(laserSpeed.value) !== 1) {
        this.originalSpeed = Number(laserSpeed.value);
        progressCaller.update(this.progressId, {
          message: lang.message.settingLaserSpeed,
        });
        await deviceMaster.setLaserSpeed(1);
      }
      progressCaller.update(this.progressId, { message: lang.message.enteringRawMode });
      await deviceMaster.enterRawMode();
      progressCaller.update(this.progressId, { message: lang.message.exitingRotaryMode });
      await deviceMaster.rawSetRotary(false);
      progressCaller.update(this.progressId, { message: lang.message.homing });
      await deviceMaster.rawHome();
      await deviceMaster.rawStartLineCheckMode();
      this.lineCheckEnabled = true;
      progressCaller.update(this.progressId, { message: lang.message.turningOffFan });
      await deviceMaster.rawSetFan(false);
      progressCaller.update(this.progressId, { message: lang.message.turningOffAirPump });
      await deviceMaster.rawSetAirPump(false);
      await deviceMaster.rawSetWaterPump(false);
      progressCaller.update(this.progressId, { message: lang.message.connectingCamera });
      await this.setupFisheyeCamera();
      return true;
    } catch (error) {
      await this.end();
      console.log('Error in setup', error);
      if (error.message && error.message.startsWith('Camera WS')) {
        alertCaller.popUpError({
          message: `${lang.topbar.alerts.fail_to_connect_with_camera}<br/>${error.message || ''}`,
        });
      } else {
        alertCaller.popUpError({
          message: `${lang.topbar.alerts.fail_to_start_preview}<br/>${error.message || ''}`,
        });
      }
      return false;
    } finally {
      progressCaller.popById(this.progressId);
    }
  };

  end = async (): Promise<void> => {
    try {
      const res = await deviceMaster.select(this.device);
      if (res.success) {
        deviceMaster.disconnectCamera();
        if (deviceMaster.currentControlMode !== 'raw') await deviceMaster.enterRawMode();
        if (this.lineCheckEnabled) await deviceMaster.rawEndLineCheckMode();
        await deviceMaster.rawLooseMotor();
        await deviceMaster.endRawMode();
        if (this.originalSpeed && this.originalSpeed !== 1) {
          await deviceMaster.setLaserSpeed(this.originalSpeed);
          this.originalSpeed = 1;
        }
        deviceMaster.kick();
      }
    } catch (error) {
      console.log('Failed to end BeamPreviewManager', error);
    }
  };

  setupFisheyeCamera = async (): Promise<void> => {
    await deviceMaster.connectCamera();
    let res = await deviceMaster.setFisheyeParam(this.fisheyeParams);
    if (!res) throw new Error('Failed to set fisheye parameters');
    res = await deviceMaster.setFisheyePerspectiveGrid(this.grid);
    if (!res) throw new Error('Failed to set fisheye perspective grid');
  };

  /**
   *
   * @param x x in px
   * @param y y in px
   * @returns preview camera position x, y in mm
   */
  getPreviewPosition = (x: number, y: number): { x: number; y: number } => {
    let newX = x / constant.dpmm - this.cameraCenterOffset.x;
    let newY = y / constant.dpmm - this.cameraCenterOffset.y;
    const { width, height: origH, displayHeight } = getWorkarea(this.workarea);
    const height = displayHeight ?? origH;
    newX = Math.min(Math.max(newX, -this.grid.x[0]), width - this.grid.x[1]);
    newY = Math.min(Math.max(newY, -this.grid.y[0]), height - this.grid.y[1]);
    return { x: newX, y: newY };
  };

  preprocessImage = async (
    imgUrl: string,
    opts: { overlapRatio?: number } = {}
  ): Promise<HTMLCanvasElement> => {
    const { overlapRatio = 0 } = opts;
    const img = new Image();
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.src = imgUrl;
    });
    const canvas = document.createElement('canvas');
    const ratio = this.previewPpmm / this.cameraPpmm;
    canvas.width = img.width * ratio;
    canvas.height = img.height * ratio;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Failed to get canvas context');
    ctx.scale(ratio, ratio);
    ctx.drawImage(img, 0, 0);
    const { width, height } = canvas;
    const overlapWidth = Math.round(width * overlapRatio);
    const overlapHeight = Math.round(height * overlapRatio);
    if (overlapWidth > 0 || overlapHeight > 0) {
      const imageData = ctx.getImageData(0, 0, width, height);
      for (let x = 0; x < width; x += 1) {
        for (let y = 0; y < height; y += 1) {
          const xDist = overlapWidth
            ? Math.min((Math.min(x, width - x - 1) + 1) / overlapWidth, 1)
            : 1;
          const yDist = overlapHeight
            ? Math.min((Math.min(y, height - y - 1) + 1) / overlapHeight, 1)
            : 1;
          let alphaRatio = xDist * yDist;
          if (alphaRatio < 1) {
            alphaRatio **= 1;
            const i = (y * width + x) * 4;
            imageData.data[i + 3] = Math.round(imageData.data[i + 3] * alphaRatio);
          }
        }
      }
      ctx.putImageData(imageData, 0, 0);
    }
    return canvas;
  };

  preview = async (
    x: number,
    y: number,
    opts: { overlapRatio?: number } = {}
  ): Promise<boolean> => {
    const { overlapRatio = 0 } = opts;
    const cameraPosition = this.getPreviewPosition(x, y);
    const imgUrl = await this.getPhotoAfterMoveTo(cameraPosition.x, cameraPosition.y);
    const imgCanvas = await this.preprocessImage(imgUrl, { overlapRatio });
    const drawCenter = {
      x: (cameraPosition.x + this.cameraCenterOffset.x) * constant.dpmm,
      y: (cameraPosition.y + this.cameraCenterOffset.y) * constant.dpmm,
    };
    await PreviewModeBackgroundDrawer.drawImageToCanvas(imgCanvas, drawCenter.x, drawCenter.y, {
      opacityMerge: overlapRatio > 0,
    });
    return true;
  };

  previewRegion = async (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    opts: { overlapRatio?: number } = {}
  ): Promise<boolean> => {
    const { overlapRatio = 0.05 } = opts;
    const getPoints = (): [number, number][] => {
      const imgW = (this.grid.x[1] - this.grid.x[0]) * constant.dpmm;
      const imgH = (this.grid.y[1] - this.grid.y[0]) * constant.dpmm;
      const { x: l, y: t } = this.constrainPreviewXY(Math.min(x1, x2), Math.min(y1, y2));
      const { x: r, y: b } = this.constrainPreviewXY(Math.max(x1, x2), Math.max(y1, y2));

      const res: [number, number][] = [];
      const xStep = imgW * (1 - overlapRatio);
      const yStep = imgH * (1 - overlapRatio);
      const xTotal = Math.max(1, Math.ceil((r - l) / xStep));
      const yTotal = Math.max(1, Math.ceil((b - t) / yStep));
      for (let j = 0; j < yTotal; j += 1) {
        const y = t + imgH / 2 + j * yStep;
        const row = [];
        for (let i = 0; i < xTotal; i += 1) {
          const x = l + imgW / 2 + i * xStep;
          row.push([x, y]);
        }
        if (j % 2 !== 0) row.reverse();
        res.push(...row);
      }
      return res;
    }
    const points = getPoints();
    try {
      for (let i = 0; i < points.length; i += 1) {
        MessageCaller.openMessage({
          key: 'camera-preview',
          content: `${i18n.lang.topbar.preview} ${i}/${points.length}`,
          level: MessageLevel.LOADING,
          duration: 20,
        });
        // eslint-disable-next-line no-await-in-loop
        const result = await this.preview(points[i][0], points[i][1], { overlapRatio });
        if (!result) return false;
      }
      MessageCaller.openMessage({
        key: 'camera-preview',
        level: MessageLevel.SUCCESS,
        content: i18n.lang.device.completed,
        duration: 3,
      });
      return true;
    } catch (error) {
      MessageCaller.closeMessage('camera-preview');
      throw error;
    }
  };
}

export default BB2PreviewManager;
