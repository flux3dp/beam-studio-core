import ISVGCanvas from 'interfaces/ISVGCanvas';
import LayerModule from 'app/constants/layer-module/layer-modules';
import LayerPanelController from 'app/views/beambox/Right-Panels/contexts/LayerPanelController';
import presprayArea from 'app/actions/beambox/prespray-area';
import { DataType, writeData } from 'helpers/layer/layer-config-helper';
import { getSVGAsync } from 'helpers/svg-editor-helper';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

/**
 * Create a full color layer and select it
 * @returns layer name
 */
const createFullColorLayer = (): string => {
  const drawing = svgCanvas.getCurrentDrawing();
  const baseName = 'Full Color Layer';
  let i = 1;
  let layerName = `${baseName} ${i}`;
  while (drawing.hasLayer(layerName)) {
    i += 1;
    layerName = `${baseName} ${i}`;
  }

  svgCanvas.createLayer(layerName, '#333333', true);
  writeData(layerName, DataType.module, LayerModule.PRINTER);
  LayerPanelController.setSelectedLayers([layerName]);
  presprayArea.togglePresprayArea();

  return layerName;
};

export default createFullColorLayer;
