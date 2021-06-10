/* eslint-disable import/first */
const mockEmit = jest.fn();
jest.mock('app/views/beambox/ZoomBlock/contexts/ZoomBlockContext', () => ({
  eventEmitter: {
    emit: mockEmit,
  },
}));

import ZoomBlockController from './ZoomBlockController';

test('test ZoomBlockController', () => {
  ZoomBlockController.updateZoomBlock();
  expect(mockEmit).toHaveBeenCalledTimes(1);
  expect(mockEmit).toHaveBeenNthCalledWith(1, 'UPDATE_ZOOM_BLOCK');
});
