import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import Backlash from './Backlash';
import ConfigPanelContext from './ConfigPanelContext';

jest.mock('helpers/useI18n', () => () => ({
  beambox: {
    right_panel: {
      laser_panel: {
        backlash: 'backlash',
      },
    },
  },
}));

jest.mock('app/widgets/Unit-Input-v2', () => (
  { id, min, max, unit, defaultValue, decimal, displayMultiValue }: any
) => (
  <div>
    MockUnitInput
    <p>id: {id}</p>
    <p>min: {min}</p>
    <p>max: {max}</p>
    <p>unit: {unit}</p>
    <p>defaultValue: {defaultValue}</p>
    <p>decimal: {decimal}</p>
    <p>displayMultiValue: {displayMultiValue}</p>
  </div>
));

const mockWriteData = jest.fn();
jest.mock('helpers/layer/layer-config-helper', () => ({
  DataType: {
    backlash: 'backlash',
  },
  writeData: (...args) => mockWriteData(...args),
}));

const mockSelectedLayers = ['layer1', 'layer2'];
const mockContextState = {
  backlash: { value: 8.7, hasMultiValue: false },
};
const mockDispatch = jest.fn();

describe('test Backlash', () => {
  it('should render correctly', () => {
    const { container } = render(
      <ConfigPanelContext.Provider
        value={{ state: mockContextState as any, dispatch: mockDispatch, selectedLayers: mockSelectedLayers }}
      >
        <Backlash />
      </ConfigPanelContext.Provider>
    );
    expect(container).toMatchSnapshot();
  });

  test('onChange should work', () => {
    const { container } = render(
      <ConfigPanelContext.Provider
        value={{ state: mockContextState as any, dispatch: mockDispatch, selectedLayers: mockSelectedLayers }}
      >
        <Backlash />
      </ConfigPanelContext.Provider>
    );
    expect(mockDispatch).not.toBeCalled();
    expect(mockWriteData).not.toBeCalled();
    const input = container.querySelector('input');
    fireEvent.change(input, { target: { value: '8.8' } });
    expect(mockDispatch).toBeCalledTimes(1);
    expect(mockDispatch).toHaveBeenLastCalledWith({
      type: 'change',
      payload: { backlash: 8.8 },
    });
    expect(mockWriteData).toBeCalledTimes(2);
    expect(mockWriteData).toHaveBeenNthCalledWith(1, 'layer1', 'backlash', 8.8);
    expect(mockWriteData).toHaveBeenNthCalledWith(2, 'layer2', 'backlash', 8.8);
  });
});
