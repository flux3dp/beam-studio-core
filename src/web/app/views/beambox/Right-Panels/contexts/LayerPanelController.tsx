import eventEmitterFactory from 'helpers/eventEmitterFactory';

const layerPanelEventEmitter = eventEmitterFactory.createEventEmitter('layer-panel');

const updateLayerPanel = (): void => {
  layerPanelEventEmitter.emit('UPDATE_LAYER_PANEL');
};

const getSelectedLayers = (): string[] => {
  const response = {
    selectedLayers: [],
  };
  layerPanelEventEmitter.emit('GET_SELECTED_LAYERS', response);
  return response.selectedLayers;
};

const setSelectedLayers = (selectedLayers: string[]): void => {
  layerPanelEventEmitter.emit('SET_SELECTED_LAYERS', selectedLayers);
};

export default {
  updateLayerPanel,
  getSelectedLayers,
  setSelectedLayers,
};
