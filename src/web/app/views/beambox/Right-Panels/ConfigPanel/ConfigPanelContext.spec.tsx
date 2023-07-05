import { Action, getDefaultState, reducer } from './ConfigPanelContext';

enum DataType {
  speed = 'speed',
  strength = 'strength',
  repeat = 'repeat',
  configName = 'configName',
}

jest.mock('helpers/layer/layer-config-helper', () => ({
  DataType: {
    speed: 'speed',
    strength: 'strength',
    repeat: 'repeat',
    zstep: 'zstep',
    configName: 'configName',
  },
  defaultConfig: {
    speed: 20,
    strength: 15,
    repeat: 1,
    zstep: 0,
    configName: '',
  },
}));

describe('test ConfigPanelContext', () => {
  test('getDefaultState should work', () => {
    expect(getDefaultState()).toEqual({
      speed: { value: 20 },
      power: { value: 15 },
      repeat: { value: 1 },
      zStep: { value: 0 },
      configName: { value: '' },
    });
  });

  test('if update action work', () => {
    const state = getDefaultState();
    const newState = reducer(state, {
      type: 'update',
      payload: {
        speed: { value: 2, hasMultiValue: true },
        repeat: { value: 2 },
      },
    } as Action);
    expect(newState).toEqual({
      speed: { value: 2, hasMultiValue: true },
      power: { value: 15 },
      repeat: { value: 2 },
      zStep: { value: 0 },
      configName: { value: '' },
    });
  });

  test('if change action work', () => {
    const state = getDefaultState();
    const newState = reducer(state, {
      type: 'change',
      payload: {
        speed: 2,
        repeat: 2,
      },
    } as Action);
    expect(newState).toEqual({
      speed: { value: 2 },
      power: { value: 15 },
      repeat: { value: 2 },
      zStep: { value: 0 },
      configName: { value: '' },
    });
  });

  test('if rename action work', () => {
    const state = getDefaultState();
    const newState = reducer(state, {
      type: 'rename',
      payload: 'test',
    } as Action);
    expect(newState).toEqual({
      speed: { value: 20 },
      power: { value: 15 },
      repeat: { value: 1 },
      zStep: { value: 0 },
      configName: { value: 'test' },
      selectedItem: 'test',
    });
  });
});
