import beamboxPreference from 'app/actions/beambox/beambox-preference';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import LayerModule, { modelsWithModules } from 'app/constants/layer-module/layer-modules';
import { DataType, getData } from 'helpers/layer/layer-config-helper';
import { getSVGAsync } from 'helpers/svg-editor-helper';

import readBitmapFile from './readBitmapFile';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

// TODO: add unit test
const importBitmap = async (file: File): Promise<void> => {
  const workarea = beamboxPreference.read('workarea');

  if (modelsWithModules.includes(workarea)) {
    const drawing = svgCanvas.getCurrentDrawing();
    const currentLayer = drawing.getCurrentLayer();
    if (
      getData<LayerModule>(currentLayer, DataType.module) === LayerModule.PRINTER &&
      currentLayer.getAttribute('data-fullcolor') === '1'
    ) {
      await readBitmapFile(file, { gray: false });
      return;
    }
  }
  await readBitmapFile(file);
};

export default importBitmap;
