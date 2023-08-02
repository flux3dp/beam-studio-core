import eventEmitterFactory from 'helpers/eventEmitterFactory';

const objectPanelEventEmitter = eventEmitterFactory.createEventEmitter('object-panel');

const updateDimensionValues = (newValue: any): void => {
  objectPanelEventEmitter.emit('UPDATE_DIMENSION_VALUES', newValue);
};

const getDimensionValues = (key: string): any => {
  const response = {
    dimensionValues: {},
  };
  objectPanelEventEmitter.emit('GET_DIMENSION_VALUES', response, key);
  return response.dimensionValues;
};

const updateObjectPanel = (): void => {
  objectPanelEventEmitter.emit('UPDATE_OBJECT_PANEL');
};

const updatePolygonSides = (polygonSides: number): void => {
  objectPanelEventEmitter.emit('UPDATE_POLYGON_SIDES', polygonSides);
};

const updateActiveKey = (activeKey: string | null): void => {
  objectPanelEventEmitter.emit('UPDATE_ACTIVE_KEY', activeKey);
};

export default {
  updateObjectPanel,
  updateDimensionValues,
  getDimensionValues,
  updatePolygonSides,
  updateActiveKey,
};
