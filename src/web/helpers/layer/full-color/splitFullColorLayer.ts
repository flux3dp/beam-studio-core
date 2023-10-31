import constant from 'app/actions/beambox/constant';
import history from 'app/svgedit/history';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import NS from 'app/constants/namespaces';
import progressCaller from 'app/actions/progress-caller';
import svgStringToCanvas from 'helpers/image/svgStringToCanvas';
import symbolMaker from 'helpers/symbol-maker';
import updateImageDisplay from 'helpers/image/updateImageDisplay';
import updateImagesResolution from 'helpers/image/updateImagesResolution';
import { DataType, getData, writeDataLayer } from 'helpers/layer/layer-config-helper';
import { PrintingColors } from 'app/constants/color-constants';
import {
  cloneLayer,
  deleteLayerByName,
  getAllLayerNames,
  getLayerElementByName,
} from 'helpers/layer/layer-helper';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IBatchCommand } from 'interfaces/IHistory';

import splitColor from './splitColor';

let svgCanvas: ISVGCanvas;
let svgedit;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
  svgedit = globalSVG.Edit;
});

const PROGRESS_ID = 'split-full-color';

const layerToImage = async (
  layer: SVGGElement,
  dpi: number
): Promise<{ blob: Blob; bbox: { x: number; y: number; width: number; height: number } }> => {
  const layerClone = layer.cloneNode(true) as SVGGElement;
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
  const newImageData = ctx.getImageData(bbox.x, bbox.y, bbox.width, bbox.height);
  canvas.width = bbox.width;
  canvas.height = bbox.height;
  ctx.putImageData(newImageData, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob((b) => {
      resolve({ blob: b, bbox });
    });
  });
};

// TODO: add unit test
const splitFullColorLayer = async (
  layerName: string,
  opts: { addToHistory?: boolean } = {}
): Promise<{ cmd: IBatchCommand; newLayers: Element[] } | null> => {
  const { addToHistory = true } = opts;
  const layer = getLayerElementByName(layerName);
  if (!layer.getAttribute('data-fullcolor')) {
    return null;
  }
  progressCaller.openNonstopProgress({
    id: PROGRESS_ID,
    message: 'Splitting Full Color Layer',
    timeout: 120000,
  });
  updateImagesResolution(true, layer);
  const uses = [...layer.querySelectorAll('use')];
  uses.forEach((use) => symbolMaker.switchImageSymbol(use as SVGUseElement, false));
  const { blob, bbox } = await layerToImage(layer as SVGGElement, 300);
  uses.forEach((use) => symbolMaker.switchImageSymbol(use as SVGUseElement, true));
  if (!blob || bbox.width === 0 || bbox.height === 0) {
    progressCaller.popById(PROGRESS_ID);
    return null;
  }
  const whiteInkStaturation = getData<number>(layer, DataType.wInk);
  const cRatio = getData<number>(layer, DataType.cRatio);
  const mRatio = getData<number>(layer, DataType.mRatio);
  const yRatio = getData<number>(layer, DataType.yRatio);
  const kRatio = getData<number>(layer, DataType.kRatio);
  const includeWhite = whiteInkStaturation > 0;
  const layerImageUrl = URL.createObjectURL(blob);
  const channelBlobs = await splitColor(layerImageUrl, {
    includeWhite,
    colorRatio: {
      c: cRatio,
      m: mRatio,
      y: yRatio,
      k: kRatio,
    },
  });
  console.log(channelBlobs);

  const batchCmd = new history.BatchCommand('Split Full Color Layer');
  const newLayers: Element[] = [];
  const nameSuffix = ['W', 'K', 'C', 'M', 'Y'];
  // revert order to make sure the order of new layers is correct
  for (let i = 0; i < nameSuffix.length; i += 1) {
    // eslint-disable-next-line no-continue
    if (i === 0 && !includeWhite) {
      newLayers.push(null);
      // eslint-disable-next-line no-continue
      continue;
    }
    const color = {
      W: PrintingColors.WHITE,
      C: PrintingColors.CYAN,
      M: PrintingColors.MAGENTA,
      Y: PrintingColors.YELLOW,
      K: PrintingColors.BLACK,
    }[nameSuffix[i]];
    const res = cloneLayer(layerName, {
      isSub: true,
      name: `${layerName} (${nameSuffix[i]})`,
      configOnly: true,
    });
    if (res) {
      const { cmd, elem } = res;
      batchCmd.addSubCommand(cmd);
      elem.setAttribute('data-color', color);
      elem.setAttribute('data-fixedcolor', '1');
      if (i === 0) {
        const whiteSpeed = getData<number>(layer, DataType.wSpeed);
        const whiteMultipass = getData<number>(layer, DataType.wMultipass);
        const whiteRepeat = getData<number>(layer, DataType.wRepeat);
        writeDataLayer(elem, DataType.ink, whiteInkStaturation);
        writeDataLayer(elem, DataType.printingSpeed, whiteSpeed);
        writeDataLayer(elem, DataType.multipass, whiteMultipass);
        writeDataLayer(elem, DataType.repeat, whiteRepeat);
      }
      layer.parentNode.insertBefore(elem, layer.nextSibling);
      newLayers.push(elem);
    }
  }

  const promises = [];
  for (let i = 0; i < newLayers.length; i += 1) {
    // eslint-disable-next-line no-continue
    if (!channelBlobs[i]) continue;
    const newImgUrl = URL.createObjectURL(channelBlobs[i]);
    const newImage = document.createElementNS(NS.SVG, 'image') as unknown as SVGImageElement;
    newImage.setAttribute('x', bbox.x.toString());
    newImage.setAttribute('y', bbox.y.toString());
    newImage.setAttribute('width', bbox.width.toString());
    newImage.setAttribute('height', bbox.height.toString());
    newImage.setAttribute('id', svgCanvas.getNextId());
    newImage.setAttribute('style', 'pointer-events:inherit');
    newImage.setAttribute('preserveAspectRatio', 'none');
    newImage.setAttribute('origImage', newImgUrl);
    newImage.setAttribute('data-threshold', '254');
    newImage.setAttribute('data-shading', 'true');
    newImage.setAttribute('data-ratiofixed', 'true');
    newImage.removeAttribute('data-fullcolor');
    newLayers[i].appendChild(newImage);
    const promise = updateImageDisplay(newImage);
    promises.push(promise);
  }
  await Promise.all(promises);

  const cmd = deleteLayerByName(layerName);
  if (cmd) batchCmd.addSubCommand(cmd);
  if (addToHistory && !batchCmd.isEmpty()) svgCanvas.undoMgr.addCommandToHistory(batchCmd);
  const drawing = svgCanvas.getCurrentDrawing();
  drawing.identifyLayers();
  for (let i = 0; i < newLayers.length; i += 1) {
    if (newLayers[i]) svgCanvas.updateLayerColor(newLayers[i]);
  }
  svgCanvas.clearSelection();
  progressCaller.popById(PROGRESS_ID);
  return { cmd: batchCmd, newLayers: newLayers.filter((l) => !!l) };
};

export const tempSplitFullColorLayers = async (): Promise<() => void> => {
  const allLayerNames = getAllLayerNames();
  const addedLayers = [];
  const removedLayers = [];
  for (let i = 0; i < allLayerNames.length; i += 1) {
    const layerName = allLayerNames[i];
    const layer = getLayerElementByName(layerName);
    if (layer.getAttribute('data-fullcolor') && layer.getAttribute('display') !== 'none') {
      const { parentNode, nextSibling } = layer;
      const children = [...layer.childNodes] as Element[];
      // eslint-disable-next-line no-continue
      if (children.filter((c) => !['title', 'filter'].includes(c.tagName)).length === 0) continue;
      // eslint-disable-next-line no-await-in-loop
      const res = await splitFullColorLayer(layerName, { addToHistory: false });
      if (res) {
        const { newLayers } = res;
        addedLayers.push(...newLayers);
        removedLayers.push({ layer, parentNode, nextSibling });
      }
    }
  }
  const revert = () => {
    for (let i = removedLayers.length - 1; i >= 0; i -= 1) {
      const { layer, parentNode, nextSibling } = removedLayers[i];
      parentNode.insertBefore(layer, nextSibling);
    }
    for (let i = 0; i < addedLayers.length; i += 1) {
      const layer = addedLayers[i];
      layer.remove();
    }
  };
  return revert;
};

export default splitFullColorLayer;
