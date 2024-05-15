import BeamboxGlobalInteraction from 'app/actions/beambox/beambox-global-interaction';
import eventEmitterFactory from 'helpers/eventEmitterFactory';

const canvasEventEmitter = eventEmitterFactory.createEventEmitter('canvas');

export const setSelectedElement = (elem: Element): void => {
  if (!elem) {
    BeamboxGlobalInteraction.onObjectBlur();
  } else {
    BeamboxGlobalInteraction.onObjectBlur();
    BeamboxGlobalInteraction.onObjectFocus([elem]);
  }

  canvasEventEmitter.emit('SET_SELECTED_ELEMENT', elem);
};

export const addImage = (): void => {
  canvasEventEmitter.emit('ADD_IMAGE');
};

const setPathEditing = (val: boolean): void => {
  canvasEventEmitter.emit('SET_PATH_EDITING', val);
};

export default {
  addImage,
  setSelectedElement,
  setPathEditing,
};
