import classNames from 'classnames';
import React, { useCallback, useContext, useState } from 'react';
import { sprintf } from 'sprintf-js';

import beamboxPreference from 'app/actions/beambox/beambox-preference';
import checkDeviceStatus from 'helpers/check-device-status';
import constant from 'app/actions/beambox/constant';
import defaultModuleOffset from 'app/constants/layer-module/module-offsets';
import deviceMaster from 'helpers/device-master';
import getDevice from 'helpers/device/get-device';
import getJobOrigin from 'helpers/job-origin';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import LayerModule from 'app/constants/layer-module/layer-modules';
import MessageCaller, { MessageLevel } from 'app/actions/message-caller';
import progressCaller from 'app/actions/progress-caller';
import rotaryAxis from 'app/actions/canvas/rotary-axis';
import TopBarIcons from 'app/icons/top-bar/TopBarIcons';
import useI18n from 'helpers/useI18n';
import versionChecker from 'helpers/version-checker';
import workareaManager from 'app/svgedit/workarea';
import { CanvasContext, CanvasMode } from 'app/contexts/CanvasContext';
import { fetchFraming } from 'app/actions/beambox/export-funcs-swiftray';
import { getAllLayers } from 'helpers/layer/layer-helper';
import { getData } from 'helpers/layer/layer-config-helper';
import { getSupportInfo } from 'app/constants/add-on';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IDeviceInfo } from 'interfaces/IDevice';
import { WorkAreaModel } from 'app/constants/workarea-constants';

import styles from './FrameButton.module.scss';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const PROGRESS_ID = 'frame-task';
const FrameButton = (): JSX.Element => {
  const lang = useI18n();
  const tAlerts = lang.topbar.alerts;
  const { mode } = useContext(CanvasContext);
  const [isPromarkFraming, setIsPromarkFraming] = useState(false);

  const getCoords = useCallback((isAdor = false) => {
    const coords: {
      minX: number | undefined;
      minY: number | undefined;
      maxX: number | undefined;
      maxY: number | undefined;
    } = {
      minX: undefined,
      minY: undefined,
      maxX: undefined,
      maxY: undefined,
    };
    const { width: workareaWidth, height: fullHeight, expansion } = workareaManager;
    const workareaHeight = fullHeight - expansion[0] - expansion[1];
    const allLayers = getAllLayers();
    const offsets = { ...defaultModuleOffset, ...beamboxPreference.read('module-offsets') };
    const { dpmm } = constant;
    allLayers.forEach((layer) => {
      const module = getData(layer, 'module') as LayerModule;
      const offset: number[] = offsets[module] || [0, 0];
      const bboxs = svgCanvas.getVisibleElementsAndBBoxes([layer]);
      bboxs.forEach(({ bbox }) => {
        let { x, y } = bbox;
        if (isAdor) {
          x -= offset[0] * dpmm;
          y -= offset[1] * dpmm;
        }
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
      coords.minX = Math.max(coords.minX, 0);
      coords.minY = Math.max(coords.minY, 0);
      coords.maxX = Math.min(coords.maxX, workareaWidth);
      coords.maxY = Math.min(coords.maxY, workareaHeight);
    }
    return coords;
  }, []);


  const handlePromarkFraming = async (device: IDeviceInfo) => {
    if (isPromarkFraming) {
      await deviceMaster.stopFraming();
      setIsPromarkFraming(false);
    } else {
      const deviceStatus = await checkDeviceStatus(device);
      if (!deviceStatus) return;
      setIsPromarkFraming(true);
      console.log('start framing upload');
      await fetchFraming();
      console.log('start framing');
      await deviceMaster.startFraming();
    }
  };

  const handleClick = async () => {
    const { device } = await getDevice();
    if (!device) return;
    // Go to Promark logic
    if (constant.promarkModels.includes(device.model)) {
      await handlePromarkFraming(device);
      return;
    }
    const deviceStatus = await checkDeviceStatus(device);
    if (!deviceStatus) return;
    // Retain the original behavior
    const isAdor = constant.adorModels.includes(device.model);
    const coords = getCoords(isAdor);
    // Only check minX because it's enough to know if there is any element
    if (coords.minX === undefined) {
      MessageCaller.openMessage({
        key: 'no-element-to-frame',
        level: MessageLevel.INFO,
        content: tAlerts.add_content_first,
        duration: 3,
      });
      return;
    }

    progressCaller.openNonstopProgress({
      id: PROGRESS_ID,
      message: sprintf(lang.message.connectingMachine, device.name),
      timeout: 30000,
    });
    const supportInfo = getSupportInfo(device.model as WorkAreaModel);
    let lowLaserPower = 0;
    if (isAdor) {
      let warningMessage = '';
      const deviceDetailInfo = await deviceMaster.getDeviceDetailInfo();
      const headType = parseInt(deviceDetailInfo.head_type, 10);
      if ([LayerModule.LASER_10W_DIODE, LayerModule.LASER_20W_DIODE].includes(headType)) {
        lowLaserPower = beamboxPreference.read('low_power') * 10;
      } else if (headType === 0) {
        warningMessage = tAlerts.headtype_none + tAlerts.install_correct_headtype;
      } else if ([LayerModule.LASER_1064, LayerModule.PRINTER].includes(headType)) {
        warningMessage = tAlerts.headtype_mismatch + tAlerts.install_correct_headtype;
      } else {
        warningMessage = tAlerts.headtype_unknown + tAlerts.install_correct_headtype;
      }
      if (lowLaserPower) {
        try {
          const res = await deviceMaster.getDoorOpen();
          const isDoorOpened = res.value === '1';
          if (isDoorOpened) {
            warningMessage = tAlerts.door_opened;
          }
        } catch (error) {
          console.error(error);
          warningMessage = tAlerts.fail_to_get_door_status;
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
    let rotaryInfo: { useAAxis?: boolean; y: number; mirror?: boolean };
    const rotaryMode = beamboxPreference.read('rotary_mode');
    if (rotaryMode) {
      const y = rotaryAxis.getPosition(true);
      rotaryInfo = { y };
      if (isAdor) {
        rotaryInfo.useAAxis = true;
        // looks weird but default mirror for ador
        rotaryInfo.mirror = !beamboxPreference.read('rotary-mirror');
      }
    }
    const enabledInfo = {
      lineCheckMode: false,
      rotary: false,
      redLight: false,
      '24v': false,
    };
    const vc = versionChecker(device.version);
    const jobOrigin =
      beamboxPreference.read('enable-job-origin') &&
      vc.meetRequirement(isAdor ? 'ADOR_JOB_ORIGIN' : 'JOB_ORIGIN')
        ? getJobOrigin()
        : null;
    try {
      const curPos = { x: 0, y: 0, a: 0 };
      const movementFeedrate = 6000; // mm/min
      const moveTo = async ({
        x,
        y,
        a,
        f = movementFeedrate,
        wait,
      }: { x?: number; y?: number; a?: number; f?: number; wait?: boolean; }) => {
        let xDist = 0;
        let yDist = 0;
        if (x !== undefined) {
          // eslint-disable-next-line no-param-reassign
          if (jobOrigin) x -= jobOrigin.x;
          xDist = x - curPos.x;
          curPos.x = x;
        }
        if (y !== undefined) {
          // eslint-disable-next-line no-param-reassign
          if (jobOrigin) y -= jobOrigin.y;
          yDist = y - curPos.y;
          curPos.y = y;
        } else if (a !== undefined) {
          // eslint-disable-next-line no-param-reassign
          if (jobOrigin) a -= jobOrigin.y;
          yDist = a - curPos.a;
          curPos.a = a;
        }
        await deviceMaster.rawMove({ x, y, a, f });
        if (wait) {
          const totalDist = Math.sqrt(xDist ** 2 + yDist ** 2);
          const time = (totalDist / f) * 60 * 1000;
          await new Promise((resolve) => setTimeout(resolve, time));
        }
      };
      progressCaller.update(PROGRESS_ID, { message: lang.message.enteringRawMode });
      await deviceMaster.enterRawMode();
      progressCaller.update(PROGRESS_ID, { message: lang.message.exitingRotaryMode });
      await deviceMaster.rawSetRotary(false);
      progressCaller.update(PROGRESS_ID, { message: lang.message.homing });
      if (isAdor && rotaryInfo) await deviceMaster.rawHomeZ();
      if (jobOrigin) {
        await deviceMaster.rawUnlock();
        await deviceMaster.rawSetOrigin();
      }
      else await deviceMaster.rawHome();
      if (
        (!isAdor && vc.meetRequirement('MAINTAIN_WITH_LINECHECK')) ||
        (isAdor && vc.meetRequirement('ADOR_RELEASE'))
      ) {
        await deviceMaster.rawStartLineCheckMode();
        enabledInfo.lineCheckMode = true;
      }
      progressCaller.update(PROGRESS_ID, { message: lang.message.turningOffFan });
      await deviceMaster.rawSetFan(false);
      progressCaller.update(PROGRESS_ID, { message: lang.message.turningOffAirPump });
      await deviceMaster.rawSetAirPump(false);
      if (!isAdor) await deviceMaster.rawSetWaterPump(false);
      // TODO: add progress update with time
      progressCaller.update(PROGRESS_ID, { message: lang.device.processing });
      const { dpmm } = constant;
      coords.minX /= dpmm;
      coords.minY /= dpmm;
      coords.maxX /= dpmm;
      coords.maxY /= dpmm;
      if (rotaryInfo) {
        const { y } = rotaryInfo;
        if (isAdor) {
          await moveTo({ x: coords.minX, f: movementFeedrate });
          await moveTo({ y, f: movementFeedrate });
          await deviceMaster.rawMoveZRelToLastHome(0);
        } else {
          await moveTo({ x: 0, y, f: movementFeedrate });
        }
        await deviceMaster.rawSetRotary(true);
        curPos.a = y;
        enabledInfo.rotary = true;
      }
      const yKey = rotaryInfo?.useAAxis ? 'a' : 'y';
      if (rotaryInfo?.mirror) {
        coords.minY = 2 * rotaryInfo.y - coords.minY;
        coords.maxY = 2 * rotaryInfo.y - coords.maxY;
      }
      await moveTo({ x: coords.minX, [yKey]: coords.minY, f: movementFeedrate, wait: true });
      if (supportInfo.redLight) {
        await deviceMaster.rawSetRedLight(true);
        enabledInfo.redLight = true;
      } else if (lowLaserPower > 0) {
        await deviceMaster.rawSetLaser({ on: true, s: lowLaserPower });
        await deviceMaster.rawSet24V(true);
        enabledInfo['24v'] = true;
      }
      await moveTo({ x: coords.maxX, [yKey]: coords.minY, f: movementFeedrate });
      await moveTo({ x: coords.maxX, [yKey]: coords.maxY, f: movementFeedrate });
      await moveTo({ x: coords.minX, [yKey]: coords.maxY, f: movementFeedrate });
      await moveTo({ x: coords.minX, [yKey]: coords.minY, f: movementFeedrate });
      if (rotaryInfo) {
        if (supportInfo.redLight) {
          await deviceMaster.rawSetRedLight(false);
        } else if (lowLaserPower > 0) await deviceMaster.rawSetLaser({ on: false, s: 0 });
        await moveTo({ [yKey]: rotaryInfo.y, f: movementFeedrate });
        await deviceMaster.rawSetRotary(false);
        enabledInfo.rotary = false;
      }
      if (jobOrigin) {
        await moveTo({ x: jobOrigin.x, y: jobOrigin.y, f: movementFeedrate });
      }
    } catch (error) {
      console.log('frame error:\n', error);
    } finally {
      if (deviceMaster.currentControlMode === 'raw') {
        if (enabledInfo.lineCheckMode) await deviceMaster.rawEndLineCheckMode();
        if (enabledInfo.rotary) await deviceMaster.rawSetRotary(false);
        if (supportInfo.redLight && enabledInfo.redLight) await deviceMaster.rawSetRedLight(false);
        await deviceMaster.rawSetLaser({ on: false, s: 0 });
        if (enabledInfo['24v']) await deviceMaster.rawSet24V(false);
        await deviceMaster.rawLooseMotor();
        await deviceMaster.endRawMode();
      }
      progressCaller.popById(PROGRESS_ID);
    }
    deviceMaster.kick();
  };

  return (
    <div
      className={classNames(styles.button, { [styles.disabled]: mode !== CanvasMode.Draw })}
      onClick={handleClick}
      style={{ opacity: isPromarkFraming ? 0.5 : 1 }}
      title={lang.topbar.frame_task}
    >
      <TopBarIcons.Frame />
    </div>
  );
};

export default FrameButton;
