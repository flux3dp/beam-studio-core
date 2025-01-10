/**
 * Apply auto fit result
 */
import clipboard from 'app/svgedit/operations/clipboard';
import history from 'app/svgedit/history/history';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import undoManager from 'app/svgedit/history/undoManager';
import { AutoFitContour } from 'interfaces/IAutoFit';
import { getRotationAngle, setRotationAngle } from 'app/svgedit/transform/rotation';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { moveElements } from 'app/svgedit/operations/move';

import { ImageDimension } from './AlignModal/type';

let svgCanvas: ISVGCanvas;
getSVGAsync(({ Canvas }) => {
  svgCanvas = Canvas;
});

const apply = async (
  element: SVGElement,
  contours: AutoFitContour[],
  initDimension: ImageDimension,
  imageDimension: ImageDimension
): Promise<void> => {
  const { x, y, width, height, rotation } = imageDimension;
  const rad = (rotation * Math.PI) / 180;
  const batchCmd = new history.BatchCommand('AutoFit');

  // Scale and rotate element according to konva image dimension
  // TODO: svgCanvas.setSvgElemSize use seletedElement now, though it works now, it may cause problem in the future
  let cmd = svgCanvas.setSvgElemSize('width', width);
  if (cmd && !cmd.isEmpty()) batchCmd.addSubCommand(cmd);
  cmd = svgCanvas.setSvgElemSize('height', height);
  if (cmd && !cmd.isEmpty()) batchCmd.addSubCommand(cmd);

  const origRotation = getRotationAngle(element);
  let baseRotation = (origRotation + rotation) % 360;
  if (baseRotation > 180) baseRotation -= 360;
  setRotationAngle(element, baseRotation, { parentCmd: batchCmd });

  // move the element to the main contour
  const mainContourIdx = 0;
  const mainContour = contours[mainContourIdx];
  const [mx, my] = mainContour.center;
  const elemBBox =
    element.tagName === 'use'
      ? svgCanvas.getSvgRealLocation(element)
      : svgCanvas.calculateTransformedBBox(element);
  const ex = elemBBox.x + elemBBox.width / 2;
  const ey = elemBBox.y + elemBBox.height / 2;

  // calculate the offset of konva image center to contour center
  const calculateOffset = () => {
    const centerX = x + (width / 2) * Math.cos(rad) - (height / 2) * Math.sin(rad);
    const centerY = y + (width / 2) * Math.sin(rad) + (height / 2) * Math.cos(rad);
    const { x: initX, y: initY, width: initWidth, height: initHeight } = initDimension;
    return {
      offsetX: centerX - (initX + initWidth / 2),
      offsetY: centerY - (initY + initHeight / 2),
    };
  };
  const { offsetX, offsetY } = calculateOffset();
  moveElements([mx + offsetX - ex], [my + offsetY - ey], [element], false);

  const elemsToClone = element.getAttribute('data-tempgroup')
    ? svgCanvas.ungroupTempGroup()
    : [element];
  for (let i = 0; i < elemsToClone.length; i += 1) {
    const elemToClone = elemsToClone[i];
    const bbox =
      elemToClone.tagName === 'use'
        ? svgCanvas.getSvgRealLocation(elemToClone)
        : svgCanvas.calculateTransformedBBox(elemToClone);
    const center = [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2];
    const elemDx = center[0] - mainContour.center[0];
    const elemDy = center[1] - mainContour.center[1];
    const elemRotationAngle = getRotationAngle(elemToClone);

    for (let j = 0; j < contours.length; j++) {
      // eslint-disable-next-line no-continue
      if (j === mainContourIdx) continue;
      const contour = contours[j];
      const dAngle = contour.angle - mainContour.angle;
      let dx = contour.center[0] - mainContour.center[0];
      let dy = contour.center[1] - mainContour.center[1];
      dx += elemDx * Math.cos(dAngle) - elemDy * Math.sin(dAngle) - elemDx;
      dy += elemDx * Math.sin(dAngle) + elemDy * Math.cos(dAngle) - elemDy;
      // eslint-disable-next-line no-await-in-loop
      const res = await clipboard.cloneElements([elemToClone], [dx], [dy], {
        parentCmd: batchCmd,
        selectElement: false,
        callChangOnMove: false,
      });
      if (res) {
        const { elems } = res;
        const [newElem] = elems;
        let newAngle = elemRotationAngle + dAngle * (180 / Math.PI);
        newAngle %= 360;
        if (newAngle > 180) newAngle -= 360;
        setRotationAngle(newElem as SVGElement, newAngle);
      }
    }
  }

  if (!batchCmd.isEmpty()) undoManager.addCommandToHistory(batchCmd);
};

export default apply;
