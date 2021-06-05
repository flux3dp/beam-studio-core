/* eslint-disable import/first */
const mockEmit = jest.fn();
jest.mock('helpers/eventEmitterFactory', () => ({
  createEventEmitter: () => ({
    emit: mockEmit,
  }),
}));

import alertConstants from 'app/constants/alert-constants';
import alertCaller from './alert-caller';

describe('test alert-caller', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('test popUp', () => {
    alertCaller.popUp({
      id: '12345',
      type: 'flux alert',
    });
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenNthCalledWith(1, 'AlertProgressContext.popUp', {
      id: '12345',
      type: 'flux alert',
    });
  });

  test('test popUpError', () => {
    alertCaller.popUpError({
      id: '12345',
      type: 'flux alert',
    });
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenNthCalledWith(1, 'AlertProgressContext.popUp', {
      id: '12345',
      type: alertConstants.SHOW_POPUP_ERROR,
    });
  });

  test('test popById', () => {
    alertCaller.popById('12345');
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenNthCalledWith(1, 'AlertProgressContext.popById', '12345');
  });

  test('test checkIdExist', () => {
    alertCaller.checkIdExist('12345');
    expect(mockEmit).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenNthCalledWith(1, 'AlertProgressContext.checkIdExist', '12345', {
      idExist: false,
    });
  });
});
