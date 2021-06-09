/* eslint-disable import/first */
const mockOn = jest.fn();
const mockEmit = jest.fn();
const mockRemoveListener = jest.fn();
const mockRemoveAllListeners = jest.fn();
jest.mock('helpers/eventEmitterFactory', () => ({
  createEventEmitter: () => ({
    on: mockOn,
    emit: mockEmit,
    removeListener: mockRemoveListener,
    removeAllListeners: mockRemoveAllListeners,
  }),
}));

import beamboxStore from './beambox-store';

describe('test beambox-store', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('test onUpdateLaserPanel', () => {
    const callback = jest.fn();
    beamboxStore.onUpdateLaserPanel(callback);
    expect(mockOn).toHaveBeenCalledTimes(1);
    expect(mockOn).toHaveBeenNthCalledWith(1, 'UPDATE_LASER_PANEL', callback);
  });

  test('test onCropperShown', () => {
    const callback = jest.fn();
    beamboxStore.onCropperShown(callback);
    expect(mockOn).toHaveBeenCalledTimes(1);
    expect(mockOn).toHaveBeenNthCalledWith(1, 'SHOW_CROPPER', callback);
  });

  test('test onDrawGuideLines', () => {
    const callback = jest.fn();
    beamboxStore.onDrawGuideLines(callback);
    expect(mockOn).toHaveBeenCalledTimes(1);
    expect(mockOn).toHaveBeenNthCalledWith(1, 'DRAW_GUIDE_LINES', callback);
  });

  test('test removeUpdateLaserPanelListener', () => {
    const callback = jest.fn();
    beamboxStore.removeUpdateLaserPanelListener(callback);
    expect(mockRemoveListener).toHaveBeenCalledTimes(1);
    expect(mockRemoveListener).toHaveBeenNthCalledWith(1, 'UPDATE_LASER_PANEL', callback);
  });

  test('test removeAllUpdateLaserPanelListeners', () => {
    beamboxStore.removeAllUpdateLaserPanelListeners();
    expect(mockRemoveAllListeners).toHaveBeenCalledTimes(1);
    expect(mockRemoveAllListeners).toHaveBeenNthCalledWith(1, 'UPDATE_LASER_PANEL');
  });

  test('test removeCropperShownListener', () => {
    const callback = jest.fn();
    beamboxStore.removeCropperShownListener(callback);
    expect(mockRemoveListener).toHaveBeenCalledTimes(1);
    expect(mockRemoveListener).toHaveBeenNthCalledWith(1, 'SHOW_CROPPER', callback);
  });

  test('test emitUpdateLaserPanel', () => {
    beamboxStore.emitUpdateLaserPanel();
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenNthCalledWith(1, 'UPDATE_LASER_PANEL');
  });

  test('test emitShowCropper', () => {
    beamboxStore.emitShowCropper();
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenNthCalledWith(1, 'SHOW_CROPPER');
  });

  test('test emitDrawGuideLines', () => {
    beamboxStore.emitDrawGuideLines();
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenNthCalledWith(1, 'DRAW_GUIDE_LINES');
  });
});
