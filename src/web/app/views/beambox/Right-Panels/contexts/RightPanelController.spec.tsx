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

  test('test setSelectedElement', () => {
    RightPanelController.setSelectedElement(null);
    expect(onObjectBlur).toHaveBeenCalledTimes(1);
    expect(onObjectFocus).not.toHaveBeenCalled();
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit).toHaveBeenNthCalledWith(1, 'SET_SELECTED_ELEMENT', null);

    document.body.innerHTML = '<div id="test" />';
    const element = document.getElementById('test');
    RightPanelController.setSelectedElement(element);
    expect(onObjectBlur).toHaveBeenCalledTimes(2);
    expect(onObjectFocus).toHaveBeenCalledTimes(1);
    expect(onObjectFocus).toHaveBeenNthCalledWith(1, [element]);
    expect(emit).toHaveBeenCalledTimes(2);
    expect(emit).toHaveBeenNthCalledWith(2, 'SET_SELECTED_ELEMENT', element);
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
