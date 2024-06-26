import TopBarController from './TopBarController';

const mockEmit = jest.fn();
jest.mock('helpers/eventEmitterFactory', () => ({
  createEventEmitter: () => ({
    emit: (...args) => mockEmit(...args),
  }),
}));

const mockOnObjectBlur = jest.fn();
const mockOnObjectFocus = jest.fn();
jest.mock('app/actions/beambox/beambox-global-interaction', () => ({
  onObjectBlur: (...args) => mockOnObjectBlur(...args),
  onObjectFocus: (...args) => mockOnObjectFocus(...args),
}));

describe('test TopBarController', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('test setElement null', () => {
    TopBarController.setElement(null);
    expect(mockOnObjectBlur).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenNthCalledWith(1, 'SET_ELEMENT', null);
  });

  test('test setElement', () => {
    const testElem = document.createElement('div');
    TopBarController.setElement(testElem);
    expect(mockOnObjectBlur).toHaveBeenCalledTimes(1);
    expect(mockOnObjectFocus).toBeCalledTimes(1);
    expect(mockOnObjectFocus).toHaveBeenLastCalledWith([testElem]);
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenNthCalledWith(1, 'SET_ELEMENT', testElem);
  });

  test('test updateTitle', () => {
    TopBarController.updateTitle();
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenNthCalledWith(1, 'UPDATE_TITLE');
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
