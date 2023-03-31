import { getInitState, reducer } from './Context';

jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      right_panel: {
        laser_panel: {
          dropdown: {
            mm: {
              preset1: 'preset1',
              preset2: 'preset2',
            },
          },
        },
      },
    },
  },
}));

const mockGet = jest.fn();
jest.mock('implementations/storage', () => ({
  get: (...args) => mockGet(...args),
}));

const mockGetDefaultPresetData = jest.fn();
jest.mock('helpers/presets/preset-helper', () => ({
  getDefaultPresetData: (...args) => mockGetDefaultPresetData(...args),
}));

const mockConfigs = [
  { name: 'config1', isDefault: false, speed: 10, power: 10, repeat: 2 },
  { name: 'preset1', isDefault: true, key: 'preset1', speed: 20, power: 20, repeat: 3, zStep: 1 },
];
const mockPresetsInUse = { preset1: true, preset2: false };
let initState = null;
const resetInitState = () => {
  initState = {
    configs: [...mockConfigs],
    selectedItem: { name: '', isCustomized: true },
    presetsInUse: { ...mockPresetsInUse },
    dataChanges: {},
    displayValues: { speed: 1, power: 0, repeat: 1, zStep: 0 },
  };
};
resetInitState();

describe('test LaserManage/Context', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    resetInitState();
  });

  test('getInitState should work', () => {
    mockGet.mockReturnValueOnce(mockConfigs).mockReturnValueOnce(mockPresetsInUse);
    const state = getInitState('config1');
    expect(mockGet).toBeCalledTimes(2);
    expect(mockGet).toHaveBeenNthCalledWith(1, 'customizedLaserConfigs');
    expect(mockGet).toHaveBeenNthCalledWith(2, 'defaultLaserConfigsInUse');
    expect(state).toStrictEqual({
      configs: mockConfigs,
      selectedItem: { name: 'config1', isCustomized: true },
      presetsInUse: mockPresetsInUse,
      dataChanges: {},
      displayValues: { speed: 10, power: 10, repeat: 2, zStep: 0 },
    });
  });

  test('selecting from config', () => {
    const state = reducer(initState, {
      type: 'select',
      payload: { name: 'preset1', isCustomized: true },
    });
    expect(state).toStrictEqual({
      configs: mockConfigs,
      selectedItem: { name: 'preset1', isCustomized: true },
      presetsInUse: mockPresetsInUse,
      dataChanges: {},
      displayValues: { speed: 20, power: 20, repeat: 3, zStep: 1 },
    });
  });

  test('selecting from presets', () => {
    mockGetDefaultPresetData.mockReturnValue({ speed: 12, power: 34, repeat: 5 });
    expect(mockGetDefaultPresetData).not.toBeCalled();
    const state = reducer(initState, {
      type: 'select',
      payload: { name: 'preset2', isCustomized: false },
    });
    expect(mockGetDefaultPresetData).toBeCalledTimes(1);
    expect(mockGetDefaultPresetData).toHaveBeenLastCalledWith('preset2');
    expect(state).toStrictEqual({
      configs: mockConfigs,
      selectedItem: { name: 'preset2', isCustomized: false },
      presetsInUse: mockPresetsInUse,
      dataChanges: {},
      displayValues: { speed: 12, power: 34, repeat: 5, zStep: 0 },
    });
  });

  test('changing data', () => {
    let state = reducer(
      {
        ...initState,
        selectedItem: { name: 'config1', isCustomized: true },
        displayValues: { speed: 10, power: 10, repeat: 2, zStep: 0 },
      },
      { type: 'change', payload: { name: 'config1', key: 'speed', value: 5 } }
    );
    expect(state).toStrictEqual({
      configs: mockConfigs,
      selectedItem: { name: 'config1', isCustomized: true },
      presetsInUse: mockPresetsInUse,
      dataChanges: { config1: { speed: 5 } },
      displayValues: { speed: 5, power: 10, repeat: 2, zStep: 0 },
    });
    state = reducer(state, {
      type: 'change',
      payload: { name: 'config1', key: 'speed', value: 10 },
    });

    expect(state).toStrictEqual({
      configs: mockConfigs,
      selectedItem: { name: 'config1', isCustomized: true },
      presetsInUse: mockPresetsInUse,
      dataChanges: {},
      displayValues: { speed: 10, power: 10, repeat: 2, zStep: 0 },
    });
  });

  test('add new config', () => {
    const state = reducer(initState, { type: 'add-config', payload: { name: 'config2' } });
    expect(state).toStrictEqual({
      configs: [...mockConfigs, { name: 'config2', speed: 20, power: 15, repeat: 1, zStep: 0 }],
      selectedItem: { name: 'config2', isCustomized: true },
      presetsInUse: mockPresetsInUse,
      dataChanges: {},
      displayValues: { speed: 20, power: 15, repeat: 1, zStep: 0 },
    });
  });

  test('swap configs', () => {
    const state = reducer(initState, { type: 'swap-config', payload: { orig: 0, dist: 1 } });
    expect(state).toStrictEqual({
      ...initState,
      configs: [mockConfigs[1], mockConfigs[0]],
    });
  });

  test('add presets to config', () => {
    const newInitState = {
      ...initState,
      selectedItem: { name: 'preset2', isCustomized: false },
    };
    mockGet.mockReturnValue('mm');
    mockGetDefaultPresetData.mockReturnValue({ speed: 12, power: 34, repeat: 5 });
    const state = reducer(newInitState, { type: 'add-preset' });
    expect(mockGet).toBeCalledTimes(1);
    expect(mockGet).toHaveBeenLastCalledWith('default-units');
    expect(mockGetDefaultPresetData).toBeCalledTimes(1);
    expect(mockGetDefaultPresetData).toHaveBeenLastCalledWith('preset2');
    expect(state).toStrictEqual({
      ...initState,
      selectedItem: { name: 'preset2', isCustomized: true },
      configs: [
        ...mockConfigs,
        { name: 'preset2', key: 'preset2', isDefault: true, speed: 12, power: 34, repeat: 5, zStep: 0 },
      ],
    });
  });

  test('remove presets from config', () => {
    const newInitState = {
      ...initState,
      selectedItem: { name: 'preset1', isCustomized: true },
    };
    mockGet.mockReturnValue('mm');
    const state = reducer(newInitState, { type: 'remove-preset' });
    expect(mockGet).toBeCalledTimes(1);
    expect(mockGet).toHaveBeenLastCalledWith('default-units');
    expect(state).toStrictEqual({
      ...initState,
      selectedItem: { name: 'config1', isCustomized: true },
      configs: [mockConfigs[0]],
      displayValues: { speed: 10, power: 10, repeat: 2, zStep: 0 },
    });
  });

  test('remove presets from config', () => {
    const newInitState = {
      ...initState,
      selectedItem: { name: 'config1', isCustomized: true },
    };
    const state = reducer(newInitState, { type: 'delete' });
    expect(state).toStrictEqual({
      ...initState,
      selectedItem: { name: 'preset1', isCustomized: true },
      configs: [mockConfigs[1]],
      displayValues: { speed: 20, power: 20, repeat: 3, zStep: 1 },
    });
  });

  test('reset configs from stroage', () => {
    mockGet.mockReturnValueOnce('configs').mockReturnValueOnce('presetsInUse');
    const state = reducer(initState, { type: 'reset' });
    expect(state).toStrictEqual({
      ...initState,
      configs: 'configs',
      presetsInUse: 'presetsInUse',
    });
    expect(mockGet).toBeCalledTimes(2);
    expect(mockGet).toHaveBeenNthCalledWith(1, 'customizedLaserConfigs');
    expect(mockGet).toHaveBeenNthCalledWith(2, 'defaultLaserConfigsInUse');
  });
});
