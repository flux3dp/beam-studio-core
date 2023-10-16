/* eslint-disable import/first */
const mockEmit = jest.fn();
jest.mock('helpers/eventEmitterFactory', () => ({
  createEventEmitter: () => ({
    emit: mockEmit,
  }),
}));

import TopBarController from './TopBarController';

describe('test TopBarController', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('test setElement', () => {
    TopBarController.setElement(null);
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenNthCalledWith(1, 'SET_ELEMENT', null);
  });

  test('test setFileName', () => {
    TopBarController.setFileName('abc.txt');
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenNthCalledWith(1, 'SET_FILE_NAME', 'abc.txt');
  });

  test('test setHasUnsavedChange', () => {
    TopBarController.setHasUnsavedChange(true);
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenNthCalledWith(1, 'SET_HAS_UNSAVED_CHANGE', true);
  });

  test('test getTopBarPreviewMode', () => {
    expect(TopBarController.getTopBarPreviewMode()).toBeFalsy();
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenNthCalledWith(1, 'GET_TOP_BAR_PREVIEW_MODE', {
      isPreviewMode: false,
    });
  });

  test('test setShouldStartPreviewController', () => {
    TopBarController.setShouldStartPreviewController(true);
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenNthCalledWith(1, 'SET_SHOULD_START_PREVIEW_CONTROLLER', true);
  });

  test('test setStartPreviewCallback', () => {
    const callback = jest.fn();
    TopBarController.setStartPreviewCallback(callback);
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenNthCalledWith(1, 'SET_START_PREVIEW_CALLBACK', callback);
  });

  test('test getSelectedDevice', () => {
    TopBarController.getSelectedDevice();
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenNthCalledWith(1, 'GET_SELECTED_DEVICE', { selectedDevice: null });
  });

  test('test setSelectedDevice', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockDevice: any = { name: 'ABC' };
    TopBarController.setSelectedDevice(mockDevice);
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenNthCalledWith(1, 'SET_SELECTED_DEVICE', mockDevice);
  });
});
