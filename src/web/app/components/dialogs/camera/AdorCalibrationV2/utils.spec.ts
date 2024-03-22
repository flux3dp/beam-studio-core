import { getMaterialHeight, prepareToTakePicture } from './utils';

const mockEnterRawMode = jest.fn();
const mockRawHome = jest.fn();
const mockRawHomeZ = jest.fn();
const mockRawStartLineCheckMode = jest.fn();
const mockRawMove = jest.fn();
const mockRawEndLineCheckMode = jest.fn();
const mockRawAutoFocus = jest.fn();
const mockRawGetProbePos = jest.fn();
const mockEndRawMode = jest.fn();
const mockGetCurrentDevice = jest.fn();
jest.mock('helpers/device-master', () => ({
  enterRawMode: (...args) => mockEnterRawMode(...args),
  rawHome: (...args) => mockRawHome(...args),
  rawHomeZ: (...args) => mockRawHomeZ(...args),
  rawStartLineCheckMode: (...args) => mockRawStartLineCheckMode(...args),
  rawMove: (...args) => mockRawMove(...args),
  rawEndLineCheckMode: (...args) => mockRawEndLineCheckMode(...args),
  rawAutoFocus: (...args) => mockRawAutoFocus(...args),
  rawGetProbePos: (...args) => mockRawGetProbePos(...args),
  endRawMode: (...args) => mockEndRawMode(...args),
  get currentDevice() {
    return mockGetCurrentDevice();
  }
}));

const mockGetWorkarea = jest.fn();
jest.mock('app/constants/workarea-constants', () => ({
  getWorkarea: (...args) => mockGetWorkarea(...args),
}));

describe('test AdorCalibrationV2 utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should work for getMaterialHeight', async () => {
    mockGetWorkarea.mockReturnValue({ cameraCenter: [100, 100], deep: 100 });
    mockGetCurrentDevice.mockReturnValue({ info: { model: 'model-1' } });
    mockRawGetProbePos.mockResolvedValue({ didAf: true, z: 10 });
    const res = await getMaterialHeight();
    expect(mockGetWorkarea).toHaveBeenCalledTimes(1);
    expect(mockGetWorkarea).toHaveBeenLastCalledWith('model-1', 'ado1');
    expect(mockEnterRawMode).toHaveBeenCalledTimes(1);
    expect(mockRawHome).toHaveBeenCalledTimes(1);
    expect(mockRawStartLineCheckMode).toHaveBeenCalledTimes(1);
    expect(mockRawMove).toHaveBeenCalledTimes(1);
    expect(mockRawMove).toHaveBeenLastCalledWith({ x: 100, y: 100, f: 7500 });
    expect(mockRawEndLineCheckMode).toHaveBeenCalledTimes(1);
    expect(mockRawAutoFocus).toHaveBeenCalledTimes(1);
    expect(mockRawGetProbePos).toHaveBeenCalledTimes(1);
    expect(mockEndRawMode).toHaveBeenCalledTimes(1);
    expect(res).toBe(90);
  });

  test('prepareToTakePicture', async () => {
    await prepareToTakePicture();
    expect(mockEnterRawMode).toHaveBeenCalledTimes(1);
    expect(mockRawHome).toHaveBeenCalledTimes(1);
    expect(mockRawHomeZ).toHaveBeenCalledTimes(1);
    expect(mockEndRawMode).toHaveBeenCalledTimes(1);
  });
});
