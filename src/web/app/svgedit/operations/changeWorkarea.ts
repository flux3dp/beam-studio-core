import beamboxPreferences from 'app/actions/beambox/beambox-preference';
import beamboxStore from 'app/stores/beambox-store';
import constant from 'app/actions/beambox/constant';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import openBottomBoundaryDrawer from 'app/actions/beambox/open-bottom-boundary-drawer';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { toggleFullColorAfterWorkareaChange } from 'helpers/layer/layer-config-helper';
import { WorkAreaModel } from 'app/constants/workarea';

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
  svgCanvas.setResolution(
    constant.dimension.getWidth(workarea),
    constant.dimension.getHeight(workarea)
  );
  svgEditor.resetView();
  openBottomBoundaryDrawer.update();
  if (toggleModule) toggleFullColorAfterWorkareaChange();
  documentEventEmitter.emit('workarea-change');
  beamboxStore.emitUpdateWorkArea();
};

export default changeWorkarea;
