import EventEmitter from 'eventemitter3';
import { sprintf } from 'sprintf-js';

import beamboxPreference from 'app/actions/beambox/beambox-preference';
import checkDeviceStatus from 'helpers/check-device-status';
import constant from 'app/actions/beambox/constant';
import deviceMaster from 'helpers/device-master';
import exportFuncs from 'app/actions/beambox/export-funcs';
import findDefs from 'app/svgedit/utils/findDef';
import getJobOrigin from 'helpers/job-origin';
import getUtilWS from 'helpers/api/utils-ws';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import i18n from 'helpers/i18n';
import LayerModule from 'app/constants/layer-module/layer-modules';
import MessageCaller, { MessageLevel } from 'app/actions/message-caller';
import NS from 'app/constants/namespaces';
import rotaryAxis from 'app/actions/canvas/rotary-axis';
import svgStringToCanvas from 'helpers/image/svgStringToCanvas';
import symbolMaker from 'helpers/symbol-maker';
import versionChecker from 'helpers/version-checker';
import workareaManager from 'app/svgedit/workarea';
import { fetchFraming } from 'app/actions/beambox/export-funcs-swiftray';
import { getAllLayers } from 'helpers/layer/layer-helper';
import { getSupportInfo } from 'app/constants/add-on';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IDeviceInfo } from 'interfaces/IDevice';
import { WorkAreaModel } from 'app/constants/workarea-constants';
import alertCaller from 'app/actions/alert-caller';

// TODO: add unit test
export enum FramingType {
  Framing = 1,
  Hull = 2,
  AreaCheck = 3,
}

type Coordinates =
  | {
      minX: number;
      minY: number;
      maxX: number;
      maxY: number;
    }
  | {
      minX: undefined;
      minY: undefined;
      maxX: undefined;
      maxY: undefined;
    };

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const getCoords = (mm?: boolean): Coordinates => {
  const coords: Coordinates = {
    minX: undefined,
    minY: undefined,
    maxX: undefined,
    maxY: undefined,
  };
  const { width: workareaWidth, height: fullHeight, expansion } = workareaManager;
  const workareaHeight = fullHeight - expansion[0] - expansion[1];
  const allLayers = getAllLayers();
  const { dpmm } = constant;
  allLayers.forEach((layer) => {
    const bboxs = svgCanvas.getVisibleElementsAndBBoxes([layer]);
    bboxs.forEach(({ bbox }) => {
      const { x, y } = bbox;
      const right = x + bbox.width;
      const bottom = y + bbox.height;
      if (right < 0 || bottom < 0 || x > workareaWidth || y > workareaHeight) return;
      if (coords.minX === undefined || x < coords.minX) coords.minX = x;
      if (coords.minY === undefined || y < coords.minY) coords.minY = y;
      if (coords.maxX === undefined || right > coords.maxX) coords.maxX = right;
      if (coords.maxY === undefined || bottom > coords.maxY) coords.maxY = bottom;
    });
  });

  if (coords.minX !== undefined) {
    const ratio = mm ? dpmm : 1;
    coords.minX = Math.max(coords.minX, 0) / ratio;
    coords.minY = Math.max(coords.minY, 0) / ratio;
    coords.maxX = Math.min(coords.maxX, workareaWidth) / ratio;
    coords.maxY = Math.min(coords.maxY, workareaHeight) / ratio;
  }
  return coords;
};

const getCanvasImage = async (): Promise<Blob> => {
  symbolMaker.switchImageSymbolForAll(false);
  const allLayers = getAllLayers().map((layer) => layer.cloneNode(true) as SVGGElement);
  symbolMaker.switchImageSymbolForAll(true);
  allLayers.forEach((layer) => {
    const images = layer.querySelectorAll('image');
    images.forEach((image) => {
      const x = image.getAttribute('x');
      const y = image.getAttribute('y');
      const width = image.getAttribute('width');
      const height = image.getAttribute('height');
      const transform = image.getAttribute('transform');
      const rect = document.createElementNS(NS.SVG, 'rect');
      if (x) rect.setAttribute('x', x);
      if (y) rect.setAttribute('y', y);
      if (width) rect.setAttribute('width', width);
      if (height) rect.setAttribute('height', height);
      if (transform) rect.setAttribute('transform', transform);
      image.replaceWith(rect);
    });
  });
  const { width, height } = workareaManager;
  const svgDefs = findDefs();
  const svgString = `
    <svg
      width="${width}"
      height="${height}"
      viewBox="0 0 ${width} ${height}"
      xmlns:svg="http://www.w3.org/2000/svg"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
    >
      ${svgDefs.outerHTML}
      ${allLayers.map((layer) => layer.outerHTML).join('')}
    </svg>`;
  const canvas = await svgStringToCanvas(svgString, width, height);
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);
  const blob = await new Promise<Blob>((resolve) => canvas.toBlob(resolve));
  return blob;
};

const getConvexHull = async (imgBlob: Blob): Promise<[number, number][]> => {
  const utilWS = getUtilWS();
  const res = await utilWS.getConvexHull(imgBlob);
  return res;
};

const getAreaCheckTask = async (device?: IDeviceInfo): Promise<[number, number][]> => {
  try {
    const metadata = await exportFuncs.getMetadata(device);
    console.log(metadata);
    if (metadata?.max_x) {
      console.log(metadata);
      const minX = parseFloat(metadata.min_x);
      const minY = parseFloat(metadata.min_y);
      const maxX = parseFloat(metadata.max_x);
      const maxY = parseFloat(metadata.max_y);
      const res: [number, number][] = [
        [minX, minY],
        [maxX, minY],
        [maxX, maxY],
        [minX, maxY],
        [minX, minY],
      ];
      return res;
    }
    return [];
  } catch (err) {
    console.error('Failed to get task metadata', err);
    return [];
  }
};

class FramingTaskManager extends EventEmitter {
  private device: IDeviceInfo | null = null;
  private isAdor = false;
  private isPromark = false;
  private isWorking = false;
  private interrupted = false;
  private rotaryInfo: { useAAxis?: boolean; y: number; mirror?: boolean } = null;
  private enabledInfo: {
    lineCheckMode: boolean;
    rotary: boolean;
    redLight: boolean;
    '24v': boolean;
  };
  private jobOrigin: { x: number; y: number } = null;
  private vc: ReturnType<typeof versionChecker>;
  private curPos: { x: number; y: number; a: number };
  private movementFeedrate = 6000; // mm/min
  private lowPower = 0;
  private taskCache: { [type in FramingType]?: [number, number][] } = {};
  private taskPoints: [number, number][] = [];

  constructor(device: IDeviceInfo) {
    super();
    this.device = device;
    this.resetEnabledInfo();
    this.vc = versionChecker(device.version);
    this.isAdor = constant.adorModels.includes(device.model);
    this.isPromark = constant.promarkModels.includes(device.model);
  }

  private resetEnabledInfo = () => {
    this.enabledInfo = {
      lineCheckMode: false,
      rotary: false,
      redLight: false,
      '24v': false,
    };
  };

  private changeWorkingStatus = (status: boolean) => {
    this.isWorking = status;
    this.emit('status-change', status);
  };

  public startPromarkFraming = async (): Promise<void> => {
    if (this.isWorking) return;
    this.changeWorkingStatus(true);
    const deviceStatus = await checkDeviceStatus(this.device);
    if (!deviceStatus) return;
    console.log('start framing upload');
    await fetchFraming();
    console.log('start framing');
    await deviceMaster.startFraming();
  };

  public stopPromarkFraming = async (): Promise<void> => {
    if (!this.isWorking) return;
    await deviceMaster.stopFraming();
    this.changeWorkingStatus(false);
  };

  private moveTo = async ({
    x,
    y,
    a,
    f = this.movementFeedrate,
    wait,
  }: {
    x?: number;
    y?: number;
    a?: number;
    f?: number;
    wait?: boolean;
  }) => {
    let xDist = 0;
    let yDist = 0;
    const moveTarget = { x, y, a, f };
    if (moveTarget.x !== undefined) {
      if (this.jobOrigin) moveTarget.x -= this.jobOrigin.x;
      xDist = moveTarget.x - this.curPos.x;
      this.curPos.x = moveTarget.x;
    }
    if (moveTarget.y !== undefined) {
      if (this.rotaryInfo?.mirror && this.enabledInfo.rotary)
        moveTarget.y = 2 * this.rotaryInfo.y - moveTarget.y;
      if (this.jobOrigin) moveTarget.y -= this.jobOrigin.y;
      yDist = moveTarget.y - this.curPos.y;
      this.curPos.y = moveTarget.y;
    } else if (moveTarget.a !== undefined) {
      if (this.rotaryInfo?.mirror && this.enabledInfo.rotary)
        moveTarget.a = 2 * this.rotaryInfo.y - moveTarget.y;
      if (this.jobOrigin) moveTarget.a -= this.jobOrigin.y;
      yDist = moveTarget.a - this.curPos.a;
      this.curPos.a = moveTarget.a;
    }
    await deviceMaster.rawMove(moveTarget);
    if (wait) {
      const totalDist = Math.sqrt(xDist ** 2 + yDist ** 2);
      const time = (totalDist / f) * 60 * 1000;
      await new Promise((resolve) => setTimeout(resolve, time));
    }
  };

  private generateTaskPoints = async (type: FramingType): Promise<[number, number][]> => {
    if (this.taskCache[type]) return this.taskCache[type];
    if (type === FramingType.Framing) {
      const coords = getCoords(true);
      if (coords.minX === undefined) return [];
      const res: [number, number][] = [
        [coords.minX, coords.minY],
        [coords.maxX, coords.minY],
        [coords.maxX, coords.maxY],
        [coords.minX, coords.maxY],
        [coords.minX, coords.minY],
      ];
      this.taskCache[type] = res;
      return res;
    }
    if (type === FramingType.Hull) {
      const image = await getCanvasImage();
      const points = await getConvexHull(image);
      const res: [number, number][] = points.map(([x, y]) => [
        x / constant.dpmm,
        y / constant.dpmm,
      ]);
      res.push(res[0]);
      this.taskCache[type] = res;
      return res;
    }
    if (type === FramingType.AreaCheck) {
      const res = await getAreaCheckTask(this.device);
      console.log(res);
      if (res.length > 0) this.taskCache[type] = res;
      return res;
    }
    throw new Error('Not implemented');
  };

  private initTask = async () => {
    const selectRes = await deviceMaster.select(this.device);
    if (!selectRes.success) return;
    const deviceStatus = await checkDeviceStatus(this.device);
    if (!deviceStatus) return;
    const { lang } = i18n;
    this.emit('message', sprintf(lang.message.connectingMachine, this.device.name));
    this.resetEnabledInfo();
    this.curPos = { x: 0, y: 0, a: 0 };
    this.rotaryInfo = null;
    const rotaryMode = beamboxPreference.read('rotary_mode');
    if (rotaryMode) {
      const y = rotaryAxis.getPosition(true);
      this.rotaryInfo = { y };
      if (this.isAdor) {
        this.rotaryInfo.useAAxis = true;
        // looks weird but default mirror for ador
        this.rotaryInfo.mirror = !beamboxPreference.read('rotary-mirror');
      }
    }
    if (
      beamboxPreference.read('enable-job-origin') &&
      this.vc.meetRequirement(this.isAdor ? 'ADOR_JOB_ORIGIN' : 'JOB_ORIGIN')
    ) {
      this.jobOrigin = getJobOrigin();
    } else this.jobOrigin = null;
  };

  private setLowPowerValue = async (settingValue: number) => {
    this.lowPower = 0;
    if (constant.adorModels.includes(this.device.model) && settingValue > 0) {
      const t = i18n.lang.topbar.alerts;
      let warningMessage = '';
      const deviceDetailInfo = await deviceMaster.getDeviceDetailInfo();
      const headType = parseInt(deviceDetailInfo.head_type, 10);
      if ([LayerModule.LASER_10W_DIODE, LayerModule.LASER_20W_DIODE].includes(headType)) {
        this.lowPower = settingValue * 10; // mapping 0~100 to 0~1000
      } else if (headType === 0) {
        warningMessage = t.headtype_none + t.install_correct_headtype;
      } else if ([LayerModule.LASER_1064, LayerModule.PRINTER].includes(headType)) {
        warningMessage = t.headtype_mismatch + t.install_correct_headtype;
      } else {
        warningMessage = t.headtype_unknown + t.install_correct_headtype;
      }
      if (this.lowPower > 0) {
        try {
          const res = await deviceMaster.getDoorOpen();
          const isDoorOpened = res.value === '1';
          if (isDoorOpened) {
            warningMessage = t.door_opened;
          }
        } catch (error) {
          console.error(error);
          warningMessage = t.fail_to_get_door_status;
        }
      }
      if (warningMessage) {
        MessageCaller.openMessage({
          key: 'low-laser-warning',
          level: MessageLevel.INFO,
          content: warningMessage,
        });
      }
    }
  };

  private setupTask = async () => {
    const { lang } = i18n;
    this.emit('message', lang.message.enteringRawMode);
    await deviceMaster.enterRawMode();
    this.emit('message', lang.message.exitingRotaryMode);
    await deviceMaster.rawSetRotary(false);
    this.emit('message', lang.message.homing);
    if (this.isAdor && this.rotaryInfo) await deviceMaster.rawHomeZ();
    if (this.jobOrigin) {
      await deviceMaster.rawUnlock();
      await deviceMaster.rawSetOrigin();
    } else await deviceMaster.rawHome();
    if (
      (!this.isAdor && this.vc.meetRequirement('MAINTAIN_WITH_LINECHECK')) ||
      (this.isAdor && this.vc.meetRequirement('ADOR_RELEASE'))
    ) {
      await deviceMaster.rawStartLineCheckMode();
      this.enabledInfo.lineCheckMode = true;
    }
    this.emit('message', lang.message.turningOffFan);
    await deviceMaster.rawSetFan(false);
    this.emit('message', lang.message.turningOffAirPump);
    await deviceMaster.rawSetAirPump(false);
    if (!this.isAdor) await deviceMaster.rawSetWaterPump(false);
    this.emit('close-message');

    if (this.rotaryInfo) {
      const { y } = this.rotaryInfo;
      if (this.isAdor) {
        if (this.taskPoints.length > 0) {
          const [fistPoint] = this.taskPoints;
          await this.moveTo({ x: fistPoint[0] });
        }
        await this.moveTo({ y });
        await deviceMaster.rawMoveZRelToLastHome(0);
      } else if (this.jobOrigin) await this.moveTo({ x: this.jobOrigin[0], y });
      else await this.moveTo({ x: 0, y });
      await deviceMaster.rawSetRotary(true);
      this.curPos.a = y;
      this.enabledInfo.rotary = true;
    }
  };

  private endTask = async () => {
    if (deviceMaster.currentControlMode === 'raw') {
      const { device, enabledInfo } = this;
      const supportInfo = getSupportInfo(device.model as WorkAreaModel);
      if (enabledInfo.lineCheckMode) await deviceMaster.rawEndLineCheckMode();
      if (enabledInfo.rotary) await deviceMaster.rawSetRotary(false);
      if (supportInfo.redLight && enabledInfo.redLight) await deviceMaster.rawSetRedLight(false);
      await deviceMaster.rawSetLaser({ on: false, s: 0 });
      if (enabledInfo['24v']) await deviceMaster.rawSet24V(false);
      await deviceMaster.rawLooseMotor();
      await deviceMaster.endRawMode();
    }
  };

  private performTask = async () => {
    // TODO: add interupt logic
    const { taskPoints, device, jobOrigin, rotaryInfo } = this;
    if (taskPoints.length === 0) return;
    const supportInfo = getSupportInfo(device.model as WorkAreaModel);
    const yKey = rotaryInfo?.useAAxis ? 'a' : 'y';
    await this.moveTo({ x: taskPoints[0][0], [yKey]: taskPoints[0][1], wait: true });
    if (this.interrupted) return;
    if (supportInfo.redLight) {
      await deviceMaster.rawSetRedLight(true);
      this.enabledInfo.redLight = true;
    } else if (this.lowPower > 0) {
      await deviceMaster.rawSetLaser({ on: true, s: this.lowPower });
      await deviceMaster.rawSet24V(true);
      this.enabledInfo['24v'] = true;
    }
    if (this.interrupted) return;
    for (let i = 1; i < taskPoints.length; i += 1) {
      if (this.interrupted) return;
      // eslint-disable-next-line no-await-in-loop
      await this.moveTo({ x: taskPoints[i][0], [yKey]: taskPoints[i][1] });
    }
    if (this.interrupted) return;
    if (rotaryInfo) {
      if (supportInfo.redLight) {
        await deviceMaster.rawSetRedLight(false);
      } else if (this.lowPower > 0) await deviceMaster.rawSetLaser({ on: false, s: 0 });
      await this.moveTo({ [yKey]: rotaryInfo.y });
      await deviceMaster.rawSetRotary(false);
      this.enabledInfo.rotary = false;
    }
    if (this.interrupted) return;
    if (jobOrigin) {
      await this.moveTo({ x: jobOrigin.x, y: jobOrigin.y });
    }
  };

  public startFraming = async (type: FramingType, opts: { lowPower?: number }): Promise<void> => {
    // Go to Promark logic
    if (this.isWorking) return;
    if (this.isPromark) {
      await this.startPromarkFraming();
      return;
    }
    this.emit('message', i18n.lang.framing.calculating_task);
    this.taskPoints = await this.generateTaskPoints(type);
    if (this.taskPoints.length === 0) {
      MessageCaller.openMessage({
        key: 'no-element-to-frame',
        level: MessageLevel.INFO,
        content: i18n.lang.topbar.alerts.add_content_first,
        duration: 3,
      });
      return;
    }
    try {
      this.changeWorkingStatus(true);
      this.interrupted = false;
      await this.initTask();
      if (this.interrupted) return;
      const { lowPower = 0 } = opts;
      await this.setLowPowerValue(lowPower);
      if (this.interrupted) return;
      await this.setupTask();
      if (this.interrupted) return;
      await this.performTask();
    } catch (error) {
      console.error(error);
      alertCaller.popUp({ message: `Failed to start framing: ${error}` });
    } finally {
      this.endTask();
      this.emit('close-message');
      this.changeWorkingStatus(false);
    }
  };

  public stopFraming = async (): Promise<void> => {
    if (this.isPromark) {
      await this.stopPromarkFraming();
      return;
    }
    if (!this.isWorking) return;
    this.interrupted = true;
  };
}

export default FramingTaskManager;