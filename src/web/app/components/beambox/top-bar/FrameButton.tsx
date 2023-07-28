import React, { useCallback } from 'react';
import { sprintf } from 'sprintf-js';

import beamboxPreference from 'app/actions/beambox/beambox-preference';
import constant from 'app/actions/beambox/constant';
import deviceMaster from 'helpers/device-master';
import dialogCaller from 'app/actions/dialog-caller';
import progressCaller from 'app/actions/progress-caller';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import useI18n from 'helpers/useI18n';
import versionChecker from 'helpers/version-checker';
import { FrameIcon } from 'app/icons/icons';
import { getSVGAsync } from 'helpers/svg-editor-helper';

import styles from './FrameButton.module.scss';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const PROGRESS_ID = 'frame-task';
const FrameButton = (): JSX.Element => {
  const lang = useI18n();

  const getCoords = useCallback(() => {
    const allBBox = svgCanvas.getVisibleElementsAndBBoxes();
    const coords: {
      minX: number | undefined;
      minY: number | undefined;
      maxX: number | undefined;
      maxY: number | undefined;
    } = {
      minX: undefined, minY: undefined, maxX: undefined, maxY: undefined,
    };
    const workarea = beamboxPreference.read('workarea');
    const workareaWidth = constant.dimension.getWidth(workarea);
    const workareaHeight = constant.dimension.getHeight(workarea);
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
    const device = await dialogCaller.selectDevice();
    const coords = getCoords();
    // Only check minX because it's enough to know if there is any element
    if (coords.minX === undefined) {
      // TODO: alert no element to frame
      return;
    }

    const res = await deviceMaster.select(device);
    if (!res.success) {
      return;
    }

    progressCaller.openNonstopProgress({
      id: PROGRESS_ID,
      message: sprintf(lang.message.connectingMachine, device.name),
      timeout: 30000,
    });

    progressCaller.update(PROGRESS_ID, { message: lang.message.enteringRawMode });
    await deviceMaster.enterRawMode();
    progressCaller.update(PROGRESS_ID, { message: lang.message.exitingRotaryMode });
    await deviceMaster.rawSetRotary(false);
    progressCaller.update(PROGRESS_ID, { message: lang.message.homing });
    await deviceMaster.rawHome();
    let isLineCheckEnabled = false;
    const vc = versionChecker(device.version);
    if (vc.meetRequirement('MAINTAIN_WITH_LINECHECK')) {
      await deviceMaster.rawStartLineCheckMode();
      isLineCheckEnabled = true;
    } else isLineCheckEnabled = false;
    progressCaller.update('start-preview-mode', { message: lang.message.turningOffFan });
    await deviceMaster.rawSetFan(false);
    progressCaller.update('start-preview-mode', { message: lang.message.turningOffAirPump });
    await deviceMaster.rawSetAirPump(false);
    await deviceMaster.rawSetWaterPump(false);
    // TODO: add progress update with time
    const movementFeedrate = 6000; // mm/min
    // TODO: check if we need to wait between each move
    progressCaller.update(PROGRESS_ID, { message: 'tRunning frame' });
    const { dpmm } = constant;
    coords.minX /= dpmm;
    coords.minY /= dpmm;
    coords.maxX /= dpmm;
    coords.maxY /= dpmm;
    await deviceMaster.rawMove({
      x: coords.minX, y: coords.minY, f: movementFeedrate,
    });
    await deviceMaster.rawMove({
      x: coords.maxX, y: coords.minY, f: movementFeedrate,
    });
    await deviceMaster.rawMove({
      x: coords.maxX, y: coords.maxY, f: movementFeedrate,
    });
    await deviceMaster.rawMove({
      x: coords.minX, y: coords.maxY, f: movementFeedrate,
    });
    await deviceMaster.rawMove({
      x: coords.minX, y: coords.minY, f: movementFeedrate,
    });
    if (isLineCheckEnabled) await deviceMaster.rawEndLineCheckMode();
    await deviceMaster.rawLooseMotor();
    await deviceMaster.endRawMode();
    progressCaller.popById(PROGRESS_ID);
    deviceMaster.kick();
  };

  return (
    <div className={styles.container}>
      <button
        type="button"
        title={lang.topbar.frame_task}
        className="path-preview-button"
        onClick={handleClick}
      >
        <FrameIcon className={styles.icon} />
      </button>
    </div>
  );
};

export default FrameButton;
