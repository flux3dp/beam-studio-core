/* eslint-disable import/first */
const emit = jest.fn();
jest.mock('helpers/eventEmitterFactory', () => ({
  createEventEmitter: () => ({
    emit,
  }),
}));

import ObjectPanelController from './ObjectPanelController';

describe('test ObjectPanelController', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('test updateDimensionValues', () => {
    ObjectPanelController.updateDimensionValues({ x: 1, y: 2 });
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenNthCalledWith(1, 'UPDATE_DIMENSION_VALUES', { x: 1, y: 2 });
  });

  test('test getDimensionValues', () => {
    ObjectPanelController.getDimensionValues('x');
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenNthCalledWith(1, 'GET_DIMENSION_VALUES', {
      dimensionValues: {},
    }, 'x');
  });

  test('test updateObjectPanel', () => {
    ObjectPanelController.updateObjectPanel();
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenNthCalledWith(1, 'UPDATE_OBJECT_PANEL');
  });

  test('test updatePolygonSides', () => {
    ObjectPanelController.updatePolygonSides(8);
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenNthCalledWith(1, 'UPDATE_POLYGON_SIDES', 8);
  });

  test('test updateActiveKey', () => {
    ObjectPanelController.updateActiveKey('test-id');
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenNthCalledWith(1, 'UPDATE_ACTIVE_KEY', 'test-id');
  });

  test('test getActiveKey', () => {
    ObjectPanelController.getActiveKey();
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenNthCalledWith(1, 'GET_ACTIVE_KEY', {
      activeKey: undefined,
    });
  });
});
