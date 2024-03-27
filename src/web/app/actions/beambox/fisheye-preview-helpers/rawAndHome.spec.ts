import rawAndHome from './rawAndHome';

jest.mock('helpers/i18n', () => ({
  lang: {
    message: {
      enteringRawMode: 'enteringRawMode',
      exitingRotaryMode: 'exitingRotaryMode',
      homing: 'homing',
    },
  },
}));

const mockEnterRawMode = jest.fn();
const mockRawSetRotary = jest.fn();
const mockRawHome = jest.fn();
const mockRawLooseMotor = jest.fn();
jest.mock('helpers/device-master', () => ({
  enterRawMode: (...args) => mockEnterRawMode(...args),
  rawSetRotary: (...args) => mockRawSetRotary(...args),
  rawHome: (...args) => mockRawHome(...args),
  rawLooseMotor: (...args) => mockRawLooseMotor(...args),
}));

const mockOpenNonstopProgress = jest.fn();
const mockUpdate = jest.fn();
const mockPopById = jest.fn();
jest.mock('app/actions/progress-caller', () => ({
  openNonstopProgress: (...args) => mockOpenNonstopProgress(...args),
  update: (...args) => mockUpdate(...args),
  popById: (...args) => mockPopById(...args),
}));

describe('test rawAndHome', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should work without progress id', async () => {
    await rawAndHome();
    expect(mockEnterRawMode).toHaveBeenCalledTimes(1);
    expect(mockRawSetRotary).toHaveBeenCalledTimes(1);
    expect(mockRawSetRotary).toHaveBeenLastCalledWith(false);
    expect(mockRawHome).toHaveBeenCalledTimes(1);
    expect(mockRawLooseMotor).toHaveBeenCalledTimes(1);
    expect(mockOpenNonstopProgress).toHaveBeenCalledTimes(1);
    expect(mockOpenNonstopProgress).toHaveBeenLastCalledWith({ id: 'raw-and-home' });
    expect(mockUpdate).toHaveBeenCalledTimes(3);
    expect(mockUpdate).toHaveBeenNthCalledWith(1, 'raw-and-home', { message: 'enteringRawMode' });
    expect(mockUpdate).toHaveBeenNthCalledWith(2, 'preview-mode-controller', { message: 'exitingRotaryMode' });
    expect(mockUpdate).toHaveBeenNthCalledWith(3, 'preview-mode-controller', { message: 'homing' });
    expect(mockPopById).toHaveBeenCalledTimes(1);
    expect(mockPopById).toHaveBeenLastCalledWith('raw-and-home');
  });

  it('should work with progress id', async () => {
    await rawAndHome('progress-id');
    expect(mockEnterRawMode).toHaveBeenCalledTimes(1);
    expect(mockRawSetRotary).toHaveBeenCalledTimes(1);
    expect(mockRawSetRotary).toHaveBeenLastCalledWith(false);
    expect(mockRawHome).toHaveBeenCalledTimes(1);
    expect(mockRawLooseMotor).toHaveBeenCalledTimes(1);
    expect(mockOpenNonstopProgress).toHaveBeenCalledTimes(0);
    expect(mockUpdate).toHaveBeenCalledTimes(3);
    expect(mockUpdate).toHaveBeenNthCalledWith(1, 'progress-id', { message: 'enteringRawMode' });
    expect(mockUpdate).toHaveBeenNthCalledWith(2, 'preview-mode-controller', { message: 'exitingRotaryMode' });
    expect(mockUpdate).toHaveBeenNthCalledWith(3, 'preview-mode-controller', { message: 'homing' });
    expect(mockPopById).toHaveBeenCalledTimes(0);
  });
});
