import beamboxPreferences from 'app/actions/beambox/beambox-preference';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import openBottomBoundaryDrawer from 'app/actions/beambox/open-bottom-boundary-drawer';
import workareaManager from 'app/svgedit/workarea';
import { toggleFullColorAfterWorkareaChange } from 'helpers/layer/layer-config-helper';
import { WorkAreaModel } from 'app/constants/workarea-constants';

const changeWorkarea = (workarea: WorkAreaModel, opts: { toggleModule?: boolean } = {}): void => {
  const { toggleModule = true } = opts;
  const documentEventEmitter = eventEmitterFactory.createEventEmitter('document-panel');
  beamboxPreferences.write('workarea', workarea);
  workareaManager.setWorkarea(workarea);
  workareaManager.resetView();
  openBottomBoundaryDrawer.update();
  if (toggleModule) toggleFullColorAfterWorkareaChange();
  documentEventEmitter.emit('workarea-change', workarea);
};

export default changeWorkarea;
