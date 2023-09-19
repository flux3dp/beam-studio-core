import constant from 'app/actions/beambox/constant';
import history from 'app/svgedit/history';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import NS from 'app/constants/namespaces';
import svgStringToCanvas from 'helpers/image/svgStringToCanvas';
import updateImageDisplay from 'helpers/image/updateImageDisplay';
import { CMYK, PrintingColors } from 'app/constants/color-constants';
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
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const layerToImage = async (
  layer: SVGGElement,
  dpi: number
): Promise<{ blob: Blob; bbox: { x: number; y: number; width: number; height: number } }> => {
  const bbox = layer.getBBox();
  let { x, y, width, height } = bbox;
  if (x < 0) {
    width += x;
    x = 0;
  }
  if (y < 0) {
    height += y;
    y = 0;
  }
  if (x + width > svgCanvas.contentW) width = svgCanvas.contentW - x;
  if (y + height > svgCanvas.contentH) height = svgCanvas.contentH - y;
  const layerClone = layer.cloneNode(true) as SVGGElement;
  const targetWidth = Math.round((width * dpi) / (25.4 * constant.dpmm));
  const targetHeight = Math.round((height * dpi) / (25.4 * constant.dpmm));
  const svgString = `
    <svg
      width="${width}"
      height="${height}"
      viewBox="${x} ${y} ${width} ${height}"
      xmlns:svg="http://www.w3.org/2000/svg"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
    >
      ${layerClone.outerHTML}
    </svg>`;
  const canvas = await svgStringToCanvas(svgString, targetWidth, targetHeight);
  console.log(canvas.toDataURL('image/png'));
  return new Promise((resolve) => {
    canvas.toBlob((b) => {
      resolve({ blob: b, bbox: { x, y, width, height } });
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
  const batchCmd = new history.BatchCommand('Split Full Color Layer');
  const newLayers: Element[] = [];
  const nameSuffix = ['K', 'C', 'M', 'Y'];
  // revert order to make sure the order of new layers is correct
  for (let i = 0; i < CMYK.length; i += 1) {
    const color = {
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
      layer.parentNode.insertBefore(elem, layer.nextSibling);
      newLayers.push(elem);
    }
  }

  const { blob, bbox } = await layerToImage(layer as SVGGElement, 300);
  const layerImageUrl = URL.createObjectURL(blob);
  const channelBlobs = await splitColor(layerImageUrl);
  const promises = [];
  for (let j = 0; j < newLayers.length; j += 1) {
    const newImgUrl = URL.createObjectURL(channelBlobs[j]);
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
    newLayers[j].appendChild(newImage);
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
    svgCanvas.updateLayerColor(newLayers[i]);
  }
  svgCanvas.clearSelection();
  return { cmd: batchCmd, newLayers };
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
