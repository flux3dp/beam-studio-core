import beamboxPreferences from 'app/actions/beambox/beambox-preference';
import beamboxStore from 'app/stores/beambox-store';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import openBottomBoundaryDrawer from 'app/actions/beambox/open-bottom-boundary-drawer';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { getWorkarea, WorkAreaModel } from 'app/constants/workarea-constants';
import { toggleFullColorAfterWorkareaChange } from 'helpers/layer/layer-config-helper';

let svgCanvas;
let svgEditor;
getSVGAsync((globalSVG) => {
  svgCanvas = globalSVG.Canvas;
  svgEditor = globalSVG.Editor;
});

const changeWorkarea = (workarea: WorkAreaModel, opts: { toggleModule?: boolean } = {}): void => {
  const { toggleModule = true } = opts;
  const documentEventEmitter = eventEmitterFactory.createEventEmitter('document-panel');
  beamboxPreferences.write('workarea', workarea);
  const { pxWidth, pxHeight, pxDisplayHeight } = getWorkarea(workarea);
  svgCanvas.setResolution(pxWidth, pxDisplayHeight ?? pxHeight);
  svgEditor.resetView();
  openBottomBoundaryDrawer.update();
  if (toggleModule) toggleFullColorAfterWorkareaChange();
  documentEventEmitter.emit('workarea-change');
  beamboxStore.emitUpdateWorkArea();
};

export default changeWorkarea;
