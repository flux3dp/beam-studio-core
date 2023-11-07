import LayerModule from 'app/constants/layer-module/layer-modules';

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
  },
}));

const mockGet = jest.fn();
const mockSet = jest.fn();
jest.mock('implementations/storage', () => ({
  get: (...args) => mockGet(...args),
  set: (...args) => mockSet(...args),
}));

const mockGetAllKeys = jest.fn();
const mockGetAllPresets = jest.fn();
jest.mock('app/constants/right-panel-constants', () => ({
  getAllKeys: (...args) => mockGetAllKeys(...args),
  getAllPresets: (...args) => mockGetAllPresets(...args),
}));

describe('test preset-helper', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('getDefaultPresetData should work when key exist', () => {
    mockPrefRead.mockReturnValue('model');
    mockGetAllPresets.mockReturnValue({
      pre1: { power: 1, speed: 2, repeat: 3, name: 'pre1' },
      pre2: { power: 6, speed: 5, repeat: 4, name: 'pre2', module: LayerModule.LASER_20W_DIODE },
    });
    const res = getDefaultPresetData('pre2');
    expect(mockPrefRead).toBeCalledTimes(1);
    expect(mockPrefRead).toHaveBeenLastCalledWith('workarea');
    expect(mockGetAllPresets).toBeCalledTimes(1);
    expect(mockGetAllPresets).toHaveBeenLastCalledWith('model');
    expect(res).toStrictEqual({
      power: 6,
      speed: 5,
      repeat: 4,
      name: 'pre2',
      module: LayerModule.LASER_20W_DIODE,
    });
  });

  test('getDefaultPresetData should work when key does not exist', () => {
    const mockError = jest.fn();
    const origError = global.console.error;
    global.console.error = mockError;
    mockPrefRead.mockReturnValue('model');
    mockGetAllPresets.mockReturnValue({
      pre1: { power: 1, speed: 2, repeat: 3, name: 'pre1' },
      pre2: { power: 6, speed: 5, repeat: 4, name: 'pre2', module: LayerModule.LASER_20W_DIODE },
    });
    const res = getDefaultPresetData('pre3');
    expect(mockError).toBeCalledTimes(1);
    expect(mockPrefRead).toBeCalledTimes(1);
    expect(mockPrefRead).toHaveBeenLastCalledWith('workarea');
    expect(mockGetAllPresets).toBeCalledTimes(1);
    expect(mockGetAllPresets).toHaveBeenLastCalledWith('model');
    expect(res).toStrictEqual({ power: 15, speed: 20, repeat: 1 });
    global.console.error = origError;
  });

  test('updateDefaultPresetData when storage is empty', () => {
    mockGetAllPresets.mockReturnValue({
      pre1: { power: 1, speed: 2, repeat: 3, name: 'pre1' },
      pre2: { power: 6, speed: 5, repeat: 4, name: 'pre2', module: LayerModule.LASER_20W_DIODE },
    });
    mockGet.mockReturnValue(null);
    const keys = updateDefaultPresetData();
    expect(mockGet).toBeCalledTimes(3);
    expect(mockSet).toBeCalledTimes(2);
    expect(mockSet).toHaveBeenNthCalledWith(1, 'customizedLaserConfigs', [
      {
        name: 'pre1',
        power: 1,
        speed: 2,
        repeat: 3,
        isDefault: true,
        key: 'pre1',
        module: LayerModule.LASER_10W_DIODE,
      },
      {
        name: 'pre2',
        power: 6,
        speed: 5,
        repeat: 4,
        isDefault: true,
        key: 'pre2',
        module: LayerModule.LASER_20W_DIODE,
      },
    ]);
    expect(mockSet).toHaveBeenNthCalledWith(2, 'defaultLaserConfigsInUse', {
      pre1: true,
      pre2: true,
    });
    expect(keys).toEqual(['pre1', 'pre2']);
  });

  test('updateDefaultPresetData when storage has some value', () => {
    mockGetAllPresets.mockReturnValue({
      pre1: { power: 1, speed: 2, repeat: 3, name: 'pre1' },
      pre2: { power: 6, speed: 5, repeat: 4, name: 'pre2', module: LayerModule.LASER_20W_DIODE },
    });
    const mockCustomizedConfigs = [
      { name: 'pre4', power: 7, speed: 8, repeat: 9, isDefault: false, key: 'pre4' },
      { name: 'pre1', power: 1, speed: 2, repeat: 3, isDefault: true, key: 'pre1' },
      { name: 'pre3', power: 6, speed: 5, repeat: 4, isDefault: true, key: 'pre3' },
    ];
    const mockDefaultInUse = { pre1: true, pre3: true };
    mockGet
      .mockReturnValueOnce('mm')
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
      {
        name: 'pre1',
        power: 1,
        speed: 2,
        repeat: 3,
        isDefault: true,
        key: 'pre1',
        module: LayerModule.LASER_10W_DIODE,
      },
      {
        name: 'pre2',
        power: 6,
        speed: 5,
        repeat: 4,
        isDefault: true,
        key: 'pre2',
        module: LayerModule.LASER_20W_DIODE,
      },
    ]);
    expect(mockSet).toHaveBeenNthCalledWith(2, 'defaultLaserConfigsInUse', {
      pre1: true,
      pre2: true,
    });
    expect(keys).toEqual(['pre1', 'pre2']);
  });
});
