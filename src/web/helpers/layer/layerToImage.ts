import constant from 'app/actions/beambox/constant';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import svgStringToCanvas from 'helpers/image/svgStringToCanvas';
import workareaManager from 'app/svgedit/workarea';
import { getSVGAsync } from 'helpers/svg-editor-helper';

import updateImageForSpliting from './full-color/updateImageForSpliting';

let svgedit;
getSVGAsync((globalSVG) => {
  svgedit = globalSVG.Edit;
});

const layerToImage = async (
  layer: SVGGElement,
  opt?: { dpi?: number; shapesOnly?: boolean; isFullColor?: boolean }
): Promise<{ blob: Blob; bbox: { x: number; y: number; width: number; height: number } }> => {
  const { dpi = 300, shapesOnly = false, isFullColor = false } = opt || {};
  const layerClone = layer.cloneNode(true) as SVGGElement;
  if (shapesOnly) layerClone.querySelectorAll('image').forEach((image) => image.remove());
  if (isFullColor) await updateImageForSpliting(layerClone);
  const ratio = dpi / (constant.dpmm * 25.4);
  const { width, height } = workareaManager;
  const canvasWidth = Math.round(width * ratio);
  const canvasHeight = Math.round(height * ratio);
  const svgDefs = svgedit.utilities.findDefs();
  const svgString = `
    <svg
      width="${canvasWidth}"
      height="${canvasHeight}"
      viewBox="0 0 ${width} ${height}"
      xmlns:svg="http://www.w3.org/2000/svg"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
    >
      ${svgDefs.outerHTML}
      ${layerClone.outerHTML}
    </svg>`;
  const canvas = await svgStringToCanvas(svgString, canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const { data } = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  const bounds = { minX: canvasWidth, minY: canvasHeight, maxX: 0, maxY: 0 };
  for (let y = 0; y < canvasHeight; y += 1) {
    for (let x = 0; x < canvasWidth; x += 1) {
      const i = (y * canvasWidth + x) * 4;
      const alpha = data[i + 3];
      if (alpha > 0) {
        if (x < bounds.minX) bounds.minX = x;
        if (x > bounds.maxX) bounds.maxX = x;
        if (y < bounds.minY) bounds.minY = y;
        if (y > bounds.maxY) bounds.maxY = y;
      }
    }
  }
  if (bounds.minX > bounds.maxX || bounds.minY > bounds.maxY)
    return { blob: null, bbox: { x: 0, y: 0, width: 0, height: 0 } };
  const bbox = {
    x: bounds.minX,
    y: bounds.minY,
    width: bounds.maxX - bounds.minX + 1,
    height: bounds.maxY - bounds.minY + 1,
  };
  const outputBbox = {
    x: Math.round(bbox.x / ratio),
    y: Math.round(bbox.y / ratio),
    width: Math.round(bbox.width / ratio),
    height: Math.round(bbox.height / ratio),
  };
  const outCanvas = document.createElement('canvas');
  outCanvas.width = outputBbox.width;
  outCanvas.height = outputBbox.height;
  const outCtx = outCanvas.getContext('2d');
  if (!isFullColor) outCtx.filter = 'brightness(0%)';
  outCtx.drawImage(
    canvas,
    bbox.x,
    bbox.y,
    bbox.width,
    bbox.height,
    0,
    0,
    outCanvas.width,
    outCanvas.height
  );

  return new Promise((resolve) => {
    outCanvas.toBlob((b) => {
      resolve({ blob: b, bbox: outputBbox });
    });
  });
};

export default layerToImage;
