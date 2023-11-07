/* eslint-disable import/first */
const emit = jest.fn();
jest.mock('helpers/eventEmitterFactory', () => ({
  createEventEmitter: () => ({
    emit,
  }),
}));

const onObjectBlur = jest.fn();
const onObjectFocus = jest.fn();
jest.mock('app/actions/beambox/beambox-global-interaction', () => ({
  onObjectBlur,
  onObjectFocus,
}));

import RightPanelController from './RightPanelController';

describe('test RightPanelController', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('test toPathEditMode', () => {
    RightPanelController.toPathEditMode();
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenNthCalledWith(1, 'SET_MODE', 'path-edit');
  });

  test('test toElementMode', () => {
    RightPanelController.toElementMode();
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenNthCalledWith(1, 'SET_MODE', 'element');
  });
});
