import beamboxPreferences from 'app/actions/beambox/beambox-preference';
import beamboxStore from 'app/stores/beambox-store';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import openBottomBoundaryDrawer from 'app/actions/beambox/open-bottom-boundary-drawer';
import workareaManager from 'app/svgedit/workarea';
import { getSVGAsync } from 'helpers/svg-editor-helper';
import { toggleFullColorAfterWorkareaChange } from 'helpers/layer/layer-config-helper';
import { WorkAreaModel } from 'app/constants/workarea-constants';

let svgEditor;
getSVGAsync((globalSVG) => {
  svgEditor = globalSVG.Editor;
});

const changeWorkarea = (workarea: WorkAreaModel, opts: { toggleModule?: boolean } = {}): void => {
  const { toggleModule = true } = opts;
  const documentEventEmitter = eventEmitterFactory.createEventEmitter('document-panel');
  beamboxPreferences.write('workarea', workarea);
  workareaManager.setWorkarea(workarea);
  svgEditor.resetView();
  openBottomBoundaryDrawer.update();
  if (toggleModule) toggleFullColorAfterWorkareaChange();
  documentEventEmitter.emit('workarea-change');
  beamboxStore.emitUpdateWorkArea();
};

export default changeWorkarea;
