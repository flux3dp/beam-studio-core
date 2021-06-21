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
    expect(emit).toHaveBeenNthCalledWith(1, 'GET_DIMENSION_VALUES', 'x', {
      dimensionValues: {},
    });
  });

  test('test updateObjectPanel', () => {
    ObjectPanelController.updateObjectPanel();
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenNthCalledWith(1, 'UPDATE_OBJECT_PANEL');
  });
});
