import classNames from 'classnames';
import React, { useCallback, useContext } from 'react';
import { sprintf } from 'sprintf-js';

import beamboxPreference from 'app/actions/beambox/beambox-preference';
import checkDeviceStatus from 'helpers/check-device-status';
import constant from 'app/actions/beambox/constant';
import deviceMaster from 'helpers/device-master';
import getDevice from 'helpers/device/get-device';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import MessageCaller, { MessageLevel } from 'app/actions/message-caller';
import progressCaller from 'app/actions/progress-caller';
import TopBarIcons from 'app/icons/top-bar/TopBarIcons';
import useI18n from 'helpers/useI18n';
import versionChecker from 'helpers/version-checker';
import { CanvasContext } from 'app/contexts/CanvasContext';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { getWorkarea, WorkAreaModel } from 'app/constants/workarea-constants';

import styles from './FrameButton.module.scss';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const PROGRESS_ID = 'frame-task';
const FrameButton = (): JSX.Element => {
  const lang = useI18n();
  const { isPreviewing } = useContext(CanvasContext);

  const getCoords = useCallback(() => {
    const allBBox = svgCanvas.getVisibleElementsAndBBoxes();
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
    const workarea: WorkAreaModel = beamboxPreference.read('workarea');
    const { pxWidth: workareaWidth, pxHeight: workareaHeight } = getWorkarea(workarea);
    // TODO: consider module offset
    allBBox.forEach(({ bbox }) => {
      const { x, y, width, height } = bbox;
      const right = x + width;
      const bottom = y + height;
      if (right < 0 || bottom < 0 || x > workareaWidth || y > workareaHeight) return;
      if (coords.minX === undefined || bbox.x < coords.minX) coords.minX = bbox.x;
      if (coords.minY === undefined || bbox.y < coords.minY) coords.minY = bbox.y;
      if (coords.maxX === undefined || right > coords.maxX) coords.maxX = right;
      if (coords.maxY === undefined || bottom > coords.maxY) coords.maxY = bottom;
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
    const coords = getCoords();
    // Only check minX because it's enough to know if there is any element
    if (coords.minX === undefined) {
      MessageCaller.openMessage({
        key: 'no-element-to-frame',
        level: MessageLevel.INFO,
        content: lang.topbar.alerts.add_content_first,
        duration: 3,
      });
      return;
    }

    const { device } = await getDevice();
    if (!device) return;
    const deviceStatus = await checkDeviceStatus(device);
    if (!deviceStatus) return;

    progressCaller.openNonstopProgress({
      id: PROGRESS_ID,
      message: sprintf(lang.message.connectingMachine, device.name),
      timeout: 30000,
    });
    let isLineCheckEnabled = false;
    const isAdor = constant.adorModels.includes(device.model);
    try {
      progressCaller.update(PROGRESS_ID, { message: lang.message.enteringRawMode });
      await deviceMaster.enterRawMode();
      progressCaller.update(PROGRESS_ID, { message: lang.message.exitingRotaryMode });
      await deviceMaster.rawSetRotary(false);
      progressCaller.update(PROGRESS_ID, { message: lang.message.homing });
      await deviceMaster.rawHome();
      const vc = versionChecker(device.version);
      if (
        (!isAdor && vc.meetRequirement('MAINTAIN_WITH_LINECHECK')) ||
        (isAdor && vc.meetRequirement('ADOR_RELEASE'))
      ) {
        await deviceMaster.rawStartLineCheckMode();
        isLineCheckEnabled = true;
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
      await deviceMaster.rawMove({ x: coords.minX, y: coords.minY, f: movementFeedrate });
      await deviceMaster.rawMove({ x: coords.maxX, y: coords.minY, f: movementFeedrate });
      await deviceMaster.rawMove({ x: coords.maxX, y: coords.maxY, f: movementFeedrate });
      await deviceMaster.rawMove({ x: coords.minX, y: coords.maxY, f: movementFeedrate });
      await deviceMaster.rawMove({ x: coords.minX, y: coords.minY, f: movementFeedrate });
    } catch (error) {
      console.log('frame error:\n', error);
    } finally {
      if (deviceMaster.currentControlMode === 'raw') {
        if (isLineCheckEnabled) await deviceMaster.rawEndLineCheckMode();
        await deviceMaster.rawLooseMotor();
        await deviceMaster.endRawMode();
      }
      progressCaller.popById(PROGRESS_ID);
    }
    deviceMaster.kick();
  };

  return (
    <div
      className={classNames(styles.button, { [styles.disabled]: isPreviewing })}
      onClick={handleClick}
      title={lang.topbar.frame_task}
    >
      <TopBarIcons.Frame />
    </div>
  );
};

export default FrameButton;
