import eventEmitterFactory from 'helpers/eventEmitterFactory';

const rightPanelEventEmitter = eventEmitterFactory.createEventEmitter('right-panel');

const toPathEditMode = (): void => {
  rightPanelEventEmitter.emit('SET_MODE', 'path-edit');
};

const toElementMode = (): void => {
  rightPanelEventEmitter.emit('SET_MODE', 'element');
};

const toPreviewMode = (): void => {
  rightPanelEventEmitter.emit('SET_MODE', 'preview-color');
};

export default {
  toPathEditMode,
  toElementMode,
  toPreviewMode,
};
