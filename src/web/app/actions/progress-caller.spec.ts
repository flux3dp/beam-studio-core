/* eslint-disable import/first */
const mockEmit = jest.fn();
jest.mock('helpers/eventEmitterFactory', () => ({
  createEventEmitter: () => ({
    emit: mockEmit,
  }),
}));

import ProgressConstants from 'app/constants/progress-constants';
import progressCaller from './progress-caller';

describe('test progress-caller', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('test openNonstopProgress', () => {
    progressCaller.openNonstopProgress({
      id: '12345',
      type: 'flux progress',
      caption: 'flux caption',
    });
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenNthCalledWith(1, 'AlertProgressContext.openProgress', {
      id: '12345',
      isProgress: true,
      type: ProgressConstants.NONSTOP,
      caption: 'flux caption',
    });

    progressCaller.openNonstopProgress({
      id: '12345',
      type: 'flux progress',
      message: 'flux message',
    });
    expect(mockEmit).toHaveBeenCalledTimes(2);
    expect(mockEmit).toHaveBeenNthCalledWith(2, 'AlertProgressContext.openProgress', {
      id: '12345',
      isProgress: true,
      type: ProgressConstants.NONSTOP,
      caption: 'flux message',
      message: 'flux message',
    });
  });

  test('test openSteppingProgress', () => {
    progressCaller.openSteppingProgress({
      id: '12345',
      type: 'flux progress',
      percentage: 100,
    });
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenNthCalledWith(1, 'AlertProgressContext.openProgress', {
      id: '12345',
      isProgress: true,
      type: ProgressConstants.STEPPING,
      percentage: 100,
    });

    progressCaller.openSteppingProgress({
      id: '12345',
      type: 'flux progress',
    });
    expect(mockEmit).toHaveBeenCalledTimes(2);
    expect(mockEmit).toHaveBeenNthCalledWith(2, 'AlertProgressContext.openProgress', {
      id: '12345',
      isProgress: true,
      type: ProgressConstants.STEPPING,
      percentage: 0,
    });
  });

  test('test popById', () => {
    progressCaller.popById('12345');
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenNthCalledWith(1, 'AlertProgressContext.popById', '12345');
  });

  test('test popLastProgress', () => {
    progressCaller.popLastProgress();
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenNthCalledWith(1, 'AlertProgressContext.popLastProgress');
  });

  test('test popById', () => {
    progressCaller.update('12345', {
      id: '12345',
      type: 'flux progress',
    });
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenNthCalledWith(1, 'AlertProgressContext.updateProgress', '12345', {
      id: '12345',
      type: 'flux progress',
    });
  });
});
