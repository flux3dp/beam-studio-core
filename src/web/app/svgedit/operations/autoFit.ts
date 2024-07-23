/* eslint-disable @typescript-eslint/no-loop-func */
import alertCaller from 'app/actions/alert-caller';
import getUtilWS from 'helpers/api/utils-ws';
import history from 'app/svgedit/history/history';
import ISVGCanvas from 'interfaces/ISVGCanvas';
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

const autoFit = async (elem: SVGElement): Promise<void> => {
  const previewBackgroundUrl = previewModeBackgroundDrawer.getCameraCanvasUrl();
  if (!previewBackgroundUrl) {
    alertCaller.popUp({ message: 'Please perform camera preview first.' });
    return;
  }
  progressCaller.openNonstopProgress({ id: 'smart-fill', message: 'Processing...' });
  try {
    const utilWS = getUtilWS();
    const resp = await fetch(previewBackgroundUrl);
    const blob = await resp.blob();
    const data = await utilWS.getSimilarContours(blob);
    const parentBbox =
      elem.tagName === 'use'
        ? svgCanvas.getSvgRealLocation(elem)
        : svgCanvas.calculateTransformedBBox(elem);
    const elemRotationAngle = svgedit.utilities.getRotationAngle(elem);
    let elementContourId = -1;
    const elementContour = data.find((d, i) => {
      const boxX = d.bbox[0];
      const boxY = d.bbox[1];
      const boxWidth = d.bbox[2];
      const boxHeight = d.bbox[3];
      const intersectX =
        Math.max(parentBbox.x, boxX) < Math.min(parentBbox.x + parentBbox.width, boxX + boxWidth);
      const intersectY =
        Math.max(parentBbox.y, boxY) < Math.min(parentBbox.y + parentBbox.height, boxY + boxHeight);
      if (intersectX && intersectY) {
        elementContourId = i;
        return true;
      }
      return false;
    });
    if (elementContourId === -1) {
      alertCaller.popUp({ message: 'No Intersect contour found.' });
      return;
    }
    const elemsToClone = elem.getAttribute('data-tempgroup')
      ? svgCanvas.ungroupTempGroup()
      : [elem];
    const batchCmd = new history.BatchCommand('Auto Fit');
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
  } finally {
    progressCaller.popById('smart-fill');
  }
};

export default autoFit;
