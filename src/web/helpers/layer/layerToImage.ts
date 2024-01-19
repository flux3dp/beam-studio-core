import constant from 'app/actions/beambox/constant';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import svgStringToCanvas from 'helpers/image/svgStringToCanvas';
import { getSVGAsync } from 'helpers/svg-editor-helper';

import updateImageForSpliting from './full-color/updateImageForSpliting';

let svgCanvas: ISVGCanvas;
let svgedit;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
  svgedit = globalSVG.Edit;
});

const layerToImage = async (
  layer: SVGGElement, opt?: { dpi?: number, shapesOnly?: boolean, isFullColor?: boolean }
): Promise<{ blob: Blob; bbox: { x: number; y: number; width: number; height: number } }> => {
  const { dpi = 300, shapesOnly = false, isFullColor = false } = opt || {};
  const layerClone = layer.cloneNode(true) as SVGGElement;
  if (shapesOnly) layerClone.querySelectorAll('image').forEach((image) => image.remove());
  if (isFullColor) await updateImageForSpliting(layerClone);
  const canvasWidth = Math.round((svgCanvas.contentW * dpi) / (25.4 * constant.dpmm));
  const canvasHeight = Math.round((svgCanvas.contentH * dpi) / (25.4 * constant.dpmm));
  const svgDefs = svgedit.utilities.findDefs();
  const svgString = `
    <svg
      width="${canvasWidth}"
      height="${canvasHeight}"
      viewBox="0 0 ${canvasWidth} ${canvasHeight}"
      xmlns:svg="http://www.w3.org/2000/svg"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
    >
      ${svgDefs.outerHTML}
      ${layerClone.outerHTML}
    </svg>`;
  const canvas = await svgStringToCanvas(svgString, canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
  const { data } = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  const bounds = { minX: canvasWidth, minY: canvasHeight, maxX: 0, maxY: 0 };
  for (let y = 0; y < svgCanvas.contentH; y += 1) {
    for (let x = 0; x < svgCanvas.contentW; x += 1) {
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
  const newImageData = ctx.getImageData(bbox.x, bbox.y, bbox.width, bbox.height);
  canvas.width = bbox.width;
  canvas.height = bbox.height;
  ctx.putImageData(newImageData, 0, 0);
  if (!isFullColor) {
    ctx.filter = 'brightness(0%)';
    ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
  }
  return new Promise((resolve) => {
    canvas.toBlob((b) => {
      resolve({ blob: b, bbox });
    });
  });
};

export default layerToImage;
