import eventEmitterFactory from 'helpers/eventEmitterFactory';

const topBarEventEmitter = eventEmitterFactory.createEventEmitter('top-bar');

const updateTopBar = (): void => {
  topBarEventEmitter.emit('UPDATE_TOP_BAR');
};

const setElement = (elem: Element | null): void => {
  topBarEventEmitter.emit('SET_ELEMENT', elem);
};

const setFileName = (fileName: string): void => {
  topBarEventEmitter.emit('SET_FILE_NAME', fileName);
};

const setHasUnsavedChange = (hasUnsavedChange: boolean): void => {
  topBarEventEmitter.emit('SET_HAS_UNSAVED_CHANGE', hasUnsavedChange);
};

const getTopBarPreviewMode = (): boolean => {
  const response = {
    isPreviewMode: false,
  };
  topBarEventEmitter.emit('GET_TOP_BAR_PREVIEW_MODE', response);
  return response.isPreviewMode;
};

const setShouldStartPreviewController = (shouldStartPreviewController: boolean): void => {
  topBarEventEmitter.emit('SET_SHOULD_START_PREVIEW_CONTROLLER', shouldStartPreviewController);
};

const setStartPreviewCallback = (callback: () => void): void => {
  topBarEventEmitter.emit('SET_START_PREVIEW_CALLBACK', callback);
};

export default {
  updateTopBar,
  setElement,
  setFileName,
  setHasUnsavedChange,
  getTopBarPreviewMode,
  setShouldStartPreviewController,
  setStartPreviewCallback,
};
