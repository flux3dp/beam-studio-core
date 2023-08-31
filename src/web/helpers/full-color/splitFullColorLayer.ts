import history from 'app/svgedit/history';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import imageData from 'helpers/image-data';
import { CMYK } from 'app/constants/color-constants';
import { cloneLayer, deleteLayerByName, getLayerElementByName } from 'helpers/layer/layer-helper';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IBatchCommand } from 'interfaces/IHistory';
import { IImageDataResult } from 'interfaces/IImage';

import splitColor from './splitColor';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const updateImageDisplay = (image: HTMLImageElement, newImgBlob: Blob) => {
  const newImgUrl = URL.createObjectURL(newImgBlob);
  image.setAttribute('origImage', newImgUrl);
  image.setAttribute('data-shading', 'true');
  image.setAttribute('data-threshold', '254');
  imageData(newImgUrl, {
    width: parseFloat(image.getAttribute('width')),
    height: parseFloat(image.getAttribute('height')),
    grayscale: {
      is_rgba: true,
      is_shading: true,
      threshold: 254,
      is_svg: false,
    },
    onComplete: (result: IImageDataResult) => {
      image.setAttribute('xlink:href', result.pngBase64);
    },
  });
};

const splitFullColorLayer = async (layerName: string): Promise<IBatchCommand | null> => {
  const layer = getLayerElementByName(layerName);
  if (!layer.getAttribute('data-fullcolor')) {
    return null;
  }
  const batchCmd = new history.BatchCommand('Split Full Color Layer');
  const newLayers: Element[] = [];
  const nameSuffix = ['C', 'M', 'Y', 'K'];
  for (let i = 0; i < CMYK.length; i += 1) {
    const color = CMYK[i];
    const res = cloneLayer(layerName, true, `${layerName} (${nameSuffix[i]})`);
    if (res) {
      const { cmd, elem } = res;
      batchCmd.addSubCommand(cmd);
      elem.setAttribute('data-color', color);
      newLayers.push(elem);
    }
  }
  const newImages = [];
  for (let i = 0; i < newLayers.length; i += 1) {
    newImages.push([...newLayers[i].querySelectorAll('image')]);
  }
  const images = [...layer.querySelectorAll('image')];
  for (let i = 0; i < images.length; i += 1) {
    const image = images[i];
    // eslint-disable-next-line no-await-in-loop
    const channelBlobs = await splitColor(image.getAttribute('origImage'));
    for (let j = 0; j < newImages.length; j += 1) {
      const newImage = newImages[j][i];
      updateImageDisplay(newImage, channelBlobs[j]);
      newImage.removeAttribute('data-fullcolor');
    }
  }

  const cmd = deleteLayerByName(layerName);
  if (cmd) batchCmd.addSubCommand(cmd);
  if (!batchCmd.isEmpty()) svgCanvas.undoMgr.addCommandToHistory(batchCmd);
  const drawing = svgCanvas.getCurrentDrawing();
  drawing.identifyLayers();
  for (let i = 0; i < newLayers.length; i += 1) {
    svgCanvas.updateLayerColor(newLayers[i]);
  }
  svgCanvas.clearSelection();
  return batchCmd;
};

export default splitFullColorLayer;
