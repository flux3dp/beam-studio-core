/* eslint-disable import/first */
const mockEmit = jest.fn();
jest.mock('helpers/eventEmitterFactory', () => ({
  createEventEmitter: () => ({
    emit: mockEmit,
  }),
}));

import { clearEstimatedTime } from './TimeEstimationButtonController';

describe('test TimeEstimationButtonController', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('test clearEstimatedTime', () => {
    clearEstimatedTime();
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenNthCalledWith(1, 'SET_ESTIMATED_TIME', null);
  });
});
