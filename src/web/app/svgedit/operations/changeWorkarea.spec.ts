import changeWorkarea from './changeWorkarea';

const mockWrite = jest.fn();
jest.mock('app/actions/beambox/beambox-preference', () => ({
  write: (...args) => mockWrite(...args),
}));

const mockEmit = jest.fn();
jest.mock('helpers/eventEmitterFactory', () => ({
  createEventEmitter: () => ({
    emit: (...args) => mockEmit(...args),
  }),
}));

const mockUpdate = jest.fn();
jest.mock('app/actions/beambox/open-bottom-boundary-drawer', () => ({
  update: () => mockUpdate(),
}));

const mockSetWorkarea = jest.fn();
const mockResetView = jest.fn();
jest.mock('app/svgedit/workarea', () => ({
  setWorkarea: (...args) => mockSetWorkarea(...args),
  resetView: (...args) => mockResetView(...args),
}));

const mockToggleFullColorAfterWorkareaChange = jest.fn();
jest.mock('helpers/layer/layer-config-helper', () => ({
  toggleFullColorAfterWorkareaChange: (...args) => mockToggleFullColorAfterWorkareaChange(...args),
}));

describe('test changeWorkarea', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should work correctly', () => {
    changeWorkarea('fbm1');
    expect(mockWrite).toBeCalledTimes(1);
    expect(mockWrite).toHaveBeenLastCalledWith('workarea', 'fbm1');
    expect(mockSetWorkarea).toBeCalledTimes(1);
    expect(mockSetWorkarea).toHaveBeenLastCalledWith('fbm1');
    expect(mockResetView).toBeCalledTimes(1);
    expect(mockUpdate).toBeCalledTimes(1);
    expect(mockToggleFullColorAfterWorkareaChange).toBeCalledTimes(1);
    expect(mockEmit).toBeCalledTimes(1);
    expect(mockEmit).toHaveBeenLastCalledWith('workarea-change', 'fbm1');
  });

  it('should work correctly with toggleModule = false', () => {
    changeWorkarea('fbm1', { toggleModule: false });
    expect(mockWrite).toBeCalledTimes(1);
    expect(mockWrite).toHaveBeenLastCalledWith('workarea', 'fbm1');
    expect(mockSetWorkarea).toBeCalledTimes(1);
    expect(mockSetWorkarea).toHaveBeenLastCalledWith('fbm1');
    expect(mockResetView).toBeCalledTimes(1);
    expect(mockUpdate).toBeCalledTimes(1);
    expect(mockToggleFullColorAfterWorkareaChange).not.toBeCalled();
    expect(mockEmit).toBeCalledTimes(1);
    expect(mockEmit).toHaveBeenLastCalledWith('workarea-change', 'fbm1');
  });
});
