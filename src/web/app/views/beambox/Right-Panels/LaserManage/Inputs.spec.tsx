import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import Context from './Context';
import Inputs from './Inputs';

jest.mock('app/views/beambox/Right-Panels/LaserManage/Context', () => React.createContext({}));

const mockRead = jest.fn();
jest.mock('app/actions/beambox/beambox-preference', () => ({
  read: (...args) => mockRead(...args),
}));

const mockGet = jest.fn();
jest.mock('implementations/storage', () => ({
  get: (...args) => mockGet(...args),
}));

jest.mock('helpers/useI18n', () => () => ({
  beambox: {
    right_panel: {
      laser_panel: {
        repeat: 'repeat',
        z_step: 'z_step',
        power: { text: 'power' },
        laser_speed: { text: 'laser_speed' },
        dropdown: {
          mm: {
            preset1: 'preset1',
          },
        },
      },
    },
  },
}));

jest.mock('app/widgets/Unit-Input-v2', () => ({
  id, min, max, unit, decimal, step, defaultValue, getValue,
}: any) => (
  <div>
    Dummy Unit Input
    min: {min}
    max: {max}
    unit: {unit}
    defaultValue: {defaultValue}
    decimal: {decimal}
    step: {step}
    <button type="button" onClick={() => getValue(7)}>{id}</button>
  </div>
));

const mockDispatch = jest.fn();
describe('test PresetsList', () => {
  beforeEach(() => {
    mockGet.mockReturnValue('mm');
    mockRead.mockReturnValue('fhex1');
  });

  it('should render correctly', () => {
    const mockState = {
      selectedItem: { name: 'preset1', isCustomized: true },
      configs: [{ name: 'preset1', isDefault: false }],
      displayValues: { power: 5, speed: 5, repeat: 5, zStep: 5 },
    };
    const { container } = render(
      <Context.Provider value={{ state: mockState as any, dispatch: mockDispatch }}>
        <Inputs />
      </Context.Provider>
    );
    expect(container).toMatchSnapshot();
    expect(mockGet).toBeCalledTimes(1);
    expect(mockGet).toHaveBeenLastCalledWith('default-units');
    expect(mockRead).toBeCalledTimes(1);
    expect(mockRead).toHaveBeenLastCalledWith('workarea');
  });

  test('events should work', () => {
    const mockState = {
      selectedItem: { name: 'preset1', isCustomized: true },
      configs: [{ name: 'preset1', isDefault: false }],
      displayValues: { power: 5, speed: 5, repeat: 5, zStep: 5 },
    };
    const { getByText } = render(
      <Context.Provider value={{ state: mockState as any, dispatch: mockDispatch }}>
        <Inputs />
      </Context.Provider>
    );
    fireEvent.click(getByText('laser-power'));
    expect(mockDispatch).toBeCalledTimes(1);
    expect(mockDispatch).toHaveBeenLastCalledWith(
      { type: 'change', payload: { name: 'preset1', key: 'power', value: 7 } }
    );

    fireEvent.click(getByText('laser-speed'));
    expect(mockDispatch).toBeCalledTimes(2);
    expect(mockDispatch).toHaveBeenLastCalledWith(
      { type: 'change', payload: { name: 'preset1', key: 'speed', value: 7 } }
    );

    fireEvent.click(getByText('laser-repeat'));
    expect(mockDispatch).toBeCalledTimes(3);
    expect(mockDispatch).toHaveBeenLastCalledWith(
      { type: 'change', payload: { name: 'preset1', key: 'repeat', value: 7 } }
    );

    fireEvent.click(getByText('laser-z-step'));
    expect(mockDispatch).toBeCalledTimes(4);
    expect(mockDispatch).toHaveBeenLastCalledWith(
      { type: 'change', payload: { name: 'preset1', key: 'zStep', value: 7 } }
    );
  });
});
