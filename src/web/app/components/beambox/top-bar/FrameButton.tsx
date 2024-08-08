import classNames from 'classnames';
import React, { useCallback, useContext } from 'react';
import { sprintf } from 'sprintf-js';

import beamboxPreference from 'app/actions/beambox/beambox-preference';
import checkDeviceStatus from 'helpers/check-device-status';
import constant from 'app/actions/beambox/constant';
import defaultModuleOffset from 'app/constants/layer-module/module-offsets';
import deviceMaster from 'helpers/device-master';
import getDevice from 'helpers/device/get-device';
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
import { DataType, getData } from 'helpers/layer/layer-config-helper';
import { getAllLayers } from 'helpers/layer/layer-helper';
import { getSVGAsync } from 'helpers/svg-editor-helper';

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
      const module = getData<LayerModule>(layer, DataType.module);
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

  const handleClick = async () => {
    const { device } = await getDevice();
    if (!device) return;

    const isAdor = constant.adorModels.includes(device.model);
    const coords = getCoords(isAdor);
    console.log('frame coords:', coords);
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
    const deviceStatus = await checkDeviceStatus(device);
    if (!deviceStatus) return;

    progressCaller.openNonstopProgress({
      id: PROGRESS_ID,
      message: sprintf(lang.message.connectingMachine, device.name),
      timeout: 30000,
    });
    let lowLaserPower = 0;
    if (isAdor) {
      let warningMessage = '';
      const deviceDetailInfo = await deviceMaster.getDeviceDetailInfo();
      const headType = parseInt(deviceDetailInfo.head_type, 10);
      if ([LayerModule.LASER_10W_DIODE, LayerModule.LASER_20W_DIODE].includes(headType)) {
        lowLaserPower = beamboxPreference.read('low_power') * 10;
        console.log('lowLaserPower:', lowLaserPower);
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
      '24v': false,
    };
    try {
      progressCaller.update(PROGRESS_ID, { message: lang.message.enteringRawMode });
      await deviceMaster.enterRawMode();
      progressCaller.update(PROGRESS_ID, { message: lang.message.exitingRotaryMode });
      await deviceMaster.rawSetRotary(false);
      progressCaller.update(PROGRESS_ID, { message: lang.message.homing });
      if (isAdor && rotaryInfo) await deviceMaster.rawHomeZ();
      await deviceMaster.rawHome();
      const vc = versionChecker(device.version);
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
      const movementFeedrate = 6000; // mm/min
      // TODO: check if we need to wait between each move
      progressCaller.update(PROGRESS_ID, { message: lang.device.processing });
      const { dpmm } = constant;
      coords.minX /= dpmm;
      coords.minY /= dpmm;
      coords.maxX /= dpmm;
      coords.maxY /= dpmm;
      if (rotaryInfo) {
        const { y } = rotaryInfo;
        if (isAdor) {
          await deviceMaster.rawMove({ x: coords.minX, f: movementFeedrate });
          await deviceMaster.rawMove({ y, f: movementFeedrate });
          await deviceMaster.rawMoveZRelToLastHome(0);
        } else {
          await deviceMaster.rawMove({ x: 0, y, f: movementFeedrate });
        }
        await deviceMaster.rawSetRotary(true);
        enabledInfo.rotary = true;
      }
      const yKey = rotaryInfo?.useAAxis ? 'a' : 'y';
      if (rotaryInfo?.mirror) {
        coords.minY = 2 * rotaryInfo.y - coords.minY;
        coords.maxY = 2 * rotaryInfo.y - coords.maxY;
      }
      await deviceMaster.rawMove({ x: coords.minX, [yKey]: coords.minY, f: movementFeedrate });
      if (lowLaserPower > 0) {
        await deviceMaster.rawSetLaser({ on: true, s: lowLaserPower });
        await deviceMaster.rawSet24V(true);
        enabledInfo['24v'] = true;
      }
      await deviceMaster.rawMove({ x: coords.maxX, [yKey]: coords.minY, f: movementFeedrate });
      await deviceMaster.rawMove({ x: coords.maxX, [yKey]: coords.maxY, f: movementFeedrate });
      await deviceMaster.rawMove({ x: coords.minX, [yKey]: coords.maxY, f: movementFeedrate });
      await deviceMaster.rawMove({ x: coords.minX, [yKey]: coords.minY, f: movementFeedrate });
      if (rotaryInfo) {
        if (lowLaserPower > 0) await deviceMaster.rawSetLaser({ on: false, s: 0 });
        await deviceMaster.rawMove({ [yKey]: rotaryInfo.y, f: movementFeedrate });
        await deviceMaster.rawSetRotary(false);
        enabledInfo.rotary = false;
      }
    } catch (error) {
      console.log('frame error:\n', error);
    } finally {
      if (deviceMaster.currentControlMode === 'raw') {
        if (enabledInfo.lineCheckMode) await deviceMaster.rawEndLineCheckMode();
        if (enabledInfo.rotary) await deviceMaster.rawSetRotary(false);
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
      title={lang.topbar.frame_task}
    >
      <TopBarIcons.Frame />
    </div>
  );
};

export default FrameButton;
