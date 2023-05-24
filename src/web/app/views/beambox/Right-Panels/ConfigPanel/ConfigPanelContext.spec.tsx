import { Action, getDefaultState, reducer } from './ConfigPanelContext';

describe('test ConfigPanelContext', () => {
  test('getDefaultState should work', () => {
    expect(getDefaultState()).toEqual({
      speed: { value: 3 },
      power: { value: 1 },
      ink: { value: 3 },
      repeat: { value: 1 },
      height: { value: -3 },
      zStep: { value: 0 },
      diode: { value: 0 },
      type: { value: 1 },
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
      power: { value: 1 },
      ink: { value: 3 },
      repeat: { value: 2 },
      height: { value: -3 },
      zStep: { value: 0 },
      diode: { value: 0 },
      type: { value: 1 },
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
      power: { value: 1 },
      ink: { value: 3 },
      repeat: { value: 2 },
      height: { value: -3 },
      zStep: { value: 0 },
      diode: { value: 0 },
      type: { value: 1 },
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
      speed: { value: 3 },
      power: { value: 1 },
      ink: { value: 3 },
      repeat: { value: 1 },
      height: { value: -3 },
      zStep: { value: 0 },
      diode: { value: 0 },
      type: { value: 1 },
      configName: { value: 'test' },
      selectedItem: 'test',
    });
  });
});
