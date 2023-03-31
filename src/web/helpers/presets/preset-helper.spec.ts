import { getDefaultPresetData, updateDefaultPresetData } from './preset-helper';

const mockPrefRead = jest.fn();
jest.mock('app/actions/beambox/beambox-preference', () => ({
  read: (...args) => mockPrefRead(...args),
}));

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      right_panel: {
        laser_panel: {
          dropdown: {
            mm: {
              pre1: 'pre1',
              pre2: 'pre2',
            },
          },
        },
      },
    },
  }
}));

const mockGet = jest.fn();
const mockSet = jest.fn();
jest.mock('implementations/storage', () => ({
  get: (...args) => mockGet(...args),
  set: (...args) => mockSet(...args),
}));

const mockGetAllKeys = jest.fn();
const mockGetParametersSet = jest.fn();
jest.mock('app/constants/right-panel-constants', () => ({
  getAllKeys: (...args) => mockGetAllKeys(...args),
  getParametersSet: (...args) => mockGetParametersSet(...args),
}));

describe('test preset-helper', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('getDefaultPresetData should work when key exist', () => {
    mockPrefRead.mockReturnValue('model');
    mockGetParametersSet.mockReturnValue({
      pre1: { power: 1, speed: 2, repeat: 3 },
      pre2: { power: 6, speed: 5, repeat: 4 },
    });
    const res = getDefaultPresetData('pre2');
    expect(mockPrefRead).toBeCalledTimes(1);
    expect(mockPrefRead).toHaveBeenLastCalledWith('workarea');
    expect(mockGetParametersSet).toBeCalledTimes(1);
    expect(mockGetParametersSet).toHaveBeenLastCalledWith('model');
    expect(res).toStrictEqual({ power: 6, speed: 5, repeat: 4 });
  });

  test('getDefaultPresetData should work when key does not exist', () => {
    const mockError = jest.fn();
    const origError = global.console.error;
    global.console.error = mockError;
    mockPrefRead.mockReturnValue('model');
    mockGetParametersSet.mockReturnValue({
      pre1: { power: 1, speed: 2, repeat: 3 },
      pre2: { power: 6, speed: 5, repeat: 4 },
    });
    const res = getDefaultPresetData('pre3');
    expect(mockError).toBeCalledTimes(1);
    expect(mockPrefRead).toBeCalledTimes(1);
    expect(mockPrefRead).toHaveBeenLastCalledWith('workarea');
    expect(mockGetParametersSet).toBeCalledTimes(1);
    expect(mockGetParametersSet).toHaveBeenLastCalledWith('model');
    expect(res).toStrictEqual({ power: 15, speed: 20, repeat: 1 });
    global.console.error = origError;
  });

  test('updateDefaultPresetData when storage is empty', () => {
    mockGetParametersSet.mockReturnValue({
      pre1: { power: 1, speed: 2, repeat: 3 },
      pre2: { power: 6, speed: 5, repeat: 4 },
    });
    mockGet.mockReturnValue(null);
    const keys = updateDefaultPresetData();
    expect(mockGet).toBeCalledTimes(3);
    expect(mockSet).toBeCalledTimes(2);
    expect(mockSet).toHaveBeenNthCalledWith(1, 'customizedLaserConfigs', [
      { name: 'pre1', power: 1, speed: 2, repeat: 3, isDefault: true, key: 'pre1' },
      { name: 'pre2', power: 6, speed: 5, repeat: 4, isDefault: true, key: 'pre2' },
    ]);
    expect(mockSet).toHaveBeenNthCalledWith(2, 'defaultLaserConfigsInUse', { pre1: true, pre2: true });
    expect(keys).toEqual(['pre1', 'pre2']);
  });

  test('updateDefaultPresetData when storage has some value', () => {
    mockGetParametersSet.mockReturnValue({
      pre1: { power: 1, speed: 2, repeat: 3 },
      pre2: { power: 6, speed: 5, repeat: 4 },
    });
    const mockCustomizedConfigs = [
      { name: 'pre4', power: 7, speed: 8, repeat: 9, isDefault: false, key: 'pre4' },
      { name: 'pre1', power: 1, speed: 2, repeat: 3, isDefault: true, key: 'pre1' },
      { name: 'pre3', power: 6, speed: 5, repeat: 4, isDefault: true, key: 'pre3' },
    ];
    const mockDefaultInUse = { pre1: true, pre3: true };
    mockGet.mockReturnValueOnce('mm')
      .mockReturnValueOnce(mockCustomizedConfigs)
      .mockReturnValueOnce(mockDefaultInUse)
      .mockReturnValueOnce(mockCustomizedConfigs)
      .mockReturnValueOnce(mockDefaultInUse);
    mockGetAllKeys.mockReturnValue(new Set(['pre1', 'pre2']));
    const keys = updateDefaultPresetData();
    expect(mockGet).toBeCalledTimes(5);
    expect(mockSet).toBeCalledTimes(2);
    expect(mockGetAllKeys).toBeCalledTimes(1);
    expect(mockSet).toHaveBeenNthCalledWith(1, 'customizedLaserConfigs', [
      { name: 'pre4', power: 7, speed: 8, repeat: 9, isDefault: false, key: 'pre4' },
      { name: 'pre1', power: 1, speed: 2, repeat: 3, isDefault: true, key: 'pre1' },
      { name: 'pre2', power: 6, speed: 5, repeat: 4, isDefault: true, key: 'pre2' },
    ]);
    expect(mockSet).toHaveBeenNthCalledWith(2, 'defaultLaserConfigsInUse', { pre1: true, pre2: true });
    expect(keys).toEqual(['pre1', 'pre2']);
  });
});
