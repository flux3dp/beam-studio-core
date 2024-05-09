import eventEmitterFactory from 'helpers/eventEmitterFactory';

const rightPanelEventEmitter = eventEmitterFactory.createEventEmitter('right-panel');

const setDisplayLayer = (val: boolean): void => {
  rightPanelEventEmitter.emit('DISPLAY_LAYER', val);
};

const updatePathEditPanel = (): void => {
  rightPanelEventEmitter.emit('UPDATE_PATH_EDIT_PANEL');
}

export default {
  setDisplayLayer,
  updatePathEditPanel,
};
