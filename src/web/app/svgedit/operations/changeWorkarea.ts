import beamboxPreferences from 'app/actions/beambox/beambox-preference';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import openBottomBoundaryDrawer from 'app/actions/beambox/open-bottom-boundary-drawer';
import workareaManager from 'app/svgedit/workarea';
import { changeBeamboxPreferenceValue } from 'app/svgedit/history/beamboxPreferenceCommand';
import { toggleFullColorAfterWorkareaChange } from 'helpers/layer/layer-config-helper';
import { WorkAreaModel } from 'app/constants/workarea-constants';
import { ICommand } from 'interfaces/IHistory';

const changeWorkarea = (workarea: WorkAreaModel, opts: { toggleModule?: boolean } = {}): ICommand => {
  const { toggleModule = true } = opts;
  const documentEventEmitter = eventEmitterFactory.createEventEmitter('document-panel');
  const cmd = changeBeamboxPreferenceValue('workarea', workarea);
  const postWorkareaChange = () => {
    const currentValue = beamboxPreferences.read('workarea');
    workareaManager.setWorkarea(currentValue);
    workareaManager.resetView();
    openBottomBoundaryDrawer.update();
    if (toggleModule) toggleFullColorAfterWorkareaChange();
    documentEventEmitter.emit('workarea-change', currentValue);
  };
  postWorkareaChange();
  cmd.onAfter = () => postWorkareaChange();
  return cmd;
};

export default changeWorkarea;
