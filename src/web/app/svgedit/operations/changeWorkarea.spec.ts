import changeWorkarea from './changeWorkarea';

const mockWrite = jest.fn();
jest.mock('app/actions/beambox/beambox-preference', () => ({
  write: (...args) => mockWrite(...args),
}));

const mockEmitUpdateWorkArea = jest.fn();
jest.mock('app/stores/beambox-store', () => ({
  emitUpdateWorkArea: () => mockEmitUpdateWorkArea(),
}));

const mockEmit = jest.fn();
jest.mock('helpers/eventEmitterFactory', () => ({
  createEventEmitter: () => ({
    emit: () => mockEmit(),
  }),
}));

const mockUpdate = jest.fn();
jest.mock('app/actions/beambox/open-bottom-boundary-drawer', () => ({
  update: () => mockUpdate(),
}));

const mockSetResolution = jest.fn();
const mockResetView = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync: (callback) => {
    callback({
      Canvas: {
        setResolution: (...args) => mockSetResolution(...args),
      },
      Editor: {
        resetView: (...args) => mockResetView(...args),
      },
    });
  },
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
    expect(mockSetResolution).toBeCalledTimes(1);
    expect(mockSetResolution).toHaveBeenLastCalledWith(3000, 2100);
    expect(mockResetView).toBeCalledTimes(1);
    expect(mockUpdate).toBeCalledTimes(1);
    expect(mockToggleFullColorAfterWorkareaChange).toBeCalledTimes(1);
    expect(mockEmit).toBeCalledTimes(1);
    expect(mockEmitUpdateWorkArea).toBeCalledTimes(1);
  });

  it('should work correctly with toggleModule = false', () => {
    changeWorkarea('fbm1', { toggleModule: false });
    expect(mockWrite).toBeCalledTimes(1);
    expect(mockWrite).toHaveBeenLastCalledWith('workarea', 'fbm1');
    expect(mockSetResolution).toHaveBeenLastCalledWith(3000, 2100);
    expect(mockResetView).toBeCalledTimes(1);
    expect(mockUpdate).toBeCalledTimes(1);
    expect(mockToggleFullColorAfterWorkareaChange).not.toBeCalled();
    expect(mockEmit).toBeCalledTimes(1);
    expect(mockEmitUpdateWorkArea).toBeCalledTimes(1);
  });
});
