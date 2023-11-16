import ISVGCanvas from 'interfaces/ISVGCanvas';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { IBatchCommand } from 'interfaces/IHistory';

import { getLayerByName } from './layer-helper';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const changeLayersColor = (layerNames: string[], color: string): IBatchCommand => {
  const layers = layerNames.map((layerName) => getLayerByName(layerName)).filter((layer) => layer);
  svgCanvas.undoMgr.beginUndoableChange('data-color', layers);
  layers.forEach((layer) => {
    layer.setAttribute('data-color', color);
    if (svgCanvas.isUsingLayerColor) svgCanvas.updateLayerColor(layer);
  });
  const batchCmd = svgCanvas.undoMgr.finishUndoableChange();
  batchCmd.onAfter = () => {
    layers.forEach((layer) => {
      if (svgCanvas.isUsingLayerColor) svgCanvas.updateLayerColor(layer);
    });
  };
  return batchCmd;
}

export default changeLayersColor;
