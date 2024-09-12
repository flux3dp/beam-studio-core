import ISVGCanvas from 'interfaces/ISVGCanvas';
import LayerPanelController from 'app/views/beambox/Right-Panels/contexts/LayerPanelController';
import { getSVGAsync } from 'helpers/svg-editor-helper';

import undoManager from './undoManager';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const undo = (): void => {
  const res = undoManager.undo();
  if (res) {
    LayerPanelController.updateLayerPanel();
    svgCanvas.setHasUnsavedChange(true);
  }
};

const redo = (): void => {
  const res = undoManager.redo();
  if (res) {
    LayerPanelController.updateLayerPanel();
    svgCanvas.setHasUnsavedChange(true);
  }
}

export default {
  undo,
  redo,
};
