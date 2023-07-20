import BeamboxGlobalInteraction from 'app/actions/beambox/beambox-global-interaction';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import { IDeviceInfo } from 'interfaces/IDevice';

const topBarEventEmitter = eventEmitterFactory.createEventEmitter('top-bar');

const setElement = (elem: Element | null): void => {
  if (!elem) {
    BeamboxGlobalInteraction.onObjectBlur();
  } else {
    BeamboxGlobalInteraction.onObjectBlur();
    BeamboxGlobalInteraction.onObjectFocus([elem]);
  }

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

const getSelectedDevice = (): IDeviceInfo | null => {
  const response = {
    selectedDevice: null,
  };
  topBarEventEmitter.emit('GET_SELECTED_DEVICE', response);
  return response.selectedDevice;
};

const setSelectedDevice = (device: IDeviceInfo): void => {
  topBarEventEmitter.emit('SET_SELECTED_DEVICE', device);
};

export default {
  setElement,
  setFileName,
  setHasUnsavedChange,
  getTopBarPreviewMode,
  setShouldStartPreviewController,
  setStartPreviewCallback,
  getSelectedDevice,
  setSelectedDevice,
};
