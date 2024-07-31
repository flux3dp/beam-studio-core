/* eslint-disable @typescript-eslint/no-loop-func */
import alertCaller from 'app/actions/alert-caller';
import alertConfig from 'helpers/api/alert-config';
import alertConstants from 'app/constants/alert-constants';
import beamboxPreference from 'app/actions/beambox/beambox-preference';
import constant from 'app/actions/beambox/constant';
import getUtilWS from 'helpers/api/utils-ws';
import history from 'app/svgedit/history/history';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import i18n from 'helpers/i18n';
import previewModeBackgroundDrawer from 'app/actions/beambox/preview-mode-background-drawer';
import progressCaller from 'app/actions/progress-caller';
import undoManager from 'app/svgedit/history/undoManager';
import { getSVGAsync } from 'helpers/svg-editor-helper';

import clipboard from './clipboard';

let svgCanvas: ISVGCanvas;
let svgedit;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
  svgedit = globalSVG.Edit;
});

// TODO: add unit test
const autoFit = async (elem: SVGElement): Promise<void> => {
  const previewBackgroundUrl = previewModeBackgroundDrawer.getCameraCanvasUrl();
  const lang = i18n.lang.auto_fit;
  if (!previewBackgroundUrl) {
    alertCaller.popUp({ message: lang.preview_first });
    return;
  }
  if (!alertConfig.read('skip-auto-fit-warning')) {
    const res = await new Promise((resolve) => {
      alertCaller.popUp({
        caption: lang.title,
        message: `${lang.step1}<br/>${lang.step2}`,
        buttonType: alertConstants.CONFIRM_CANCEL,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
        links: [
          {
            text: lang.learn_more,
            url: lang.learn_more_url,
          },
        ],
        checkbox: {
          text: i18n.lang.beambox.popup.dont_show_again,
          callbacks: [
            () => {
              alertConfig.write('skip-auto-fit-warning', true);
              resolve(true);
            },
            () => resolve(false),
          ],
        },
      });
    });
    if (!res) return;
  }
  const showFailAlert = () => {
    alertCaller.popUp({
      caption: lang.title,
      message: [lang.error_tip1, lang.error_tip2, lang.error_tip3].join('<br/>'),
      links: [
        {
          text: lang.learn_more,
          url: lang.learn_more_url,
        },
      ],
    });
  };
  progressCaller.openNonstopProgress({ id: 'auto-fit', message: i18n.lang.general.processing });
  try {
    const utilWS = getUtilWS();
    const resp = await fetch(previewBackgroundUrl);
    const blob = await resp.blob();
    const workarea = beamboxPreference.read('workarea');
    const data = await utilWS.getSimilarContours(blob, { isSplcingImg: !constant.adorModels.includes(workarea) });
    const parentBbox =
      elem.tagName === 'use'
        ? svgCanvas.getSvgRealLocation(elem)
        : svgCanvas.calculateTransformedBBox(elem);
    let elementContourId = -1;
    let currentMinDist = Number.MAX_VALUE;
    const parentCenter = [parentBbox.x + parentBbox.width / 2, parentBbox.y + parentBbox.height / 2];
    data.forEach((d, i) => {
      const boxX = d.bbox[0];
      const boxY = d.bbox[1];
      const boxWidth = d.bbox[2];
      const boxHeight = d.bbox[3];
      const intersectX =
        Math.max(parentBbox.x, boxX) < Math.min(parentBbox.x + parentBbox.width, boxX + boxWidth);
      const intersectY =
        Math.max(parentBbox.y, boxY) < Math.min(parentBbox.y + parentBbox.height, boxY + boxHeight);
      if (intersectX && intersectY) {
        const distance = Math.hypot(parentCenter[0] - d.center[0], parentCenter[1] - d.center[1]);
        if (distance < currentMinDist) {
          currentMinDist = distance;
          elementContourId = i;
        }
        return true;
      }
      return false;
    });
    if (elementContourId === -1) {
      showFailAlert();
      return;
    }
    const elementContour = data[elementContourId];
    const elemsToClone = elem.getAttribute('data-tempgroup')
      ? svgCanvas.ungroupTempGroup()
      : [elem];
    const batchCmd = new history.BatchCommand('Auto Fit');
    const elemRotationAngle = svgedit.utilities.getRotationAngle(elem);
    for (let i = 0; i < elemsToClone.length; i += 1) {
      const elemToClone = elemsToClone[i];
      const bbox =
        elemToClone.tagName === 'use'
          ? svgCanvas.getSvgRealLocation(elemToClone)
          : svgCanvas.calculateTransformedBBox(elemToClone);
      const center = [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2];
      const elemDx = center[0] - elementContour.center[0];
      const elemDy = center[1] - elementContour.center[1];

      data.forEach((d, idx) => {
        if (idx === elementContourId) return;
        const dAngle = d.angle - elementContour.angle;
        let dx = d.center[0] - elementContour.center[0];
        let dy = d.center[1] - elementContour.center[1];
        dx += elemDx * Math.cos(dAngle) - elemDy * Math.sin(dAngle) - elemDx;
        dy += elemDx * Math.sin(dAngle) + elemDy * Math.cos(dAngle) - elemDy;
        const res = clipboard.cloneElements([elemToClone], [dx], [dy], {
          parentCmd: batchCmd,
          selectElement: false,
          callChangOnMove: false,
        });
        if (res) {
          const { elems } = res;
          const [newElem] = elems;
          let newAngle = elemRotationAngle + dAngle * (180 / Math.PI);
          if (newAngle > 180) newAngle -= 360;
          if (newAngle < -180) newAngle += 360;
          svgCanvas.setRotationAngle(newAngle, true, newElem as SVGElement);
          svgedit.recalculate.recalculateDimensions(newElem);
        }
      });
    }
    if (!batchCmd.isEmpty()) undoManager.addCommandToHistory(batchCmd);
  } catch (error) {
    console.error(error);
    alertCaller.popUpError({ message: `Fail to auto fit.<br/>${error}` });
  } finally {
    progressCaller.popById('auto-fit');
  }
};

export default autoFit;
