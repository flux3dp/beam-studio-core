import alertCaller from 'app/actions/alert-caller';
import beamboxPreference from 'app/actions/beambox/beambox-preference';
import createFullColorLayer from 'helpers/layer/full-color/createFullColorLayer';
import ISVGCanvas from 'interfaces/ISVGCanvas';
import i18n from 'helpers/i18n';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { modelsWithModules } from 'app/constants/layer-module/layer-modules';

import readBitmapFile from './readBitmapFile';

let svgCanvas: ISVGCanvas;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
});

const importBitmap = async (file: File): Promise<void> => {
  const workarea = beamboxPreference.read('workarea');

  if (modelsWithModules.includes(workarea)) {
    const PRINT = 1;
    const LASER = 2;
    const res = await new Promise((resolve) => {
      alertCaller.popUp({
        id: 'select-import-method',
        message: 'Select module:',
        buttonLabels: [i18n.lang.layer_module.printing, 'Laser'],
        callbacks: [() => resolve(PRINT), () => resolve(LASER)],
      });
    });
    if (res === PRINT) {
      const drawing = svgCanvas.getCurrentDrawing();
      const currentLayer = drawing.getCurrentLayer();
      if (currentLayer.getAttribute('data-fullcolor') !== '1') createFullColorLayer();
      await readBitmapFile(file, { gray: false });
      return;
    }
  }
  await readBitmapFile(file);
};

export default importBitmap;
