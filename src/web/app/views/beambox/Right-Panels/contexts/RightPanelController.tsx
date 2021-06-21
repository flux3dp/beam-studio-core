import BeamboxGlobalInteraction from 'app/actions/beambox/beambox-global-interaction';
import eventEmitterFactory from 'helpers/eventEmitterFactory';

const rightPanelEventEmitter = eventEmitterFactory.createEventEmitter('right-panel');

const setSelectedElement = (elem): void => {
  if (!elem) {
    BeamboxGlobalInteraction.onObjectBlur();
  } else {
    BeamboxGlobalInteraction.onObjectBlur();
    BeamboxGlobalInteraction.onObjectFocus([elem]);
  }
  rightPanelEventEmitter.emit('SET_SELECTED_ELEMENT', elem);
};

const toPathEditMode = (): void => {
  rightPanelEventEmitter.emit('SET_MODE', 'path-edit');
};

const toElementMode = (): void => {
  rightPanelEventEmitter.emit('SET_MODE', 'element');
};

export default {
  setSelectedElement,
  toPathEditMode,
  toElementMode,
};
