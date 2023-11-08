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
  it('should work correctly', () => {
    changeWorkarea('fbm1');
    expect(mockWrite).toBeCalledWith('workarea', 'fbm1');
    expect(mockSetResolution).toBeCalledWith(3000, 2100);
    expect(mockResetView).toBeCalled();
    expect(mockUpdate).toBeCalled();
    expect(mockToggleFullColorAfterWorkareaChange).toBeCalled();
    expect(mockEmit).toBeCalled();
    expect(mockEmitUpdateWorkArea).toBeCalled();
  });
});
