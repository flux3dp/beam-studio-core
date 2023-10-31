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

jest.mock(
  './ConfigValueDisplay',
  () =>
    ({
      inputId,
      type = 'default',
      max,
      min,
      value,
      unit,
      hasMultiValue = false,
      decimal = 0,
      onChange,
      options,
    }: any) =>
      (
        <div>
          MockConfigValueDisplay
          <p>inputId: {inputId}</p>
          <p>type: {type}</p>
          <p>max: {max}</p>
          <p>min: {min}</p>
          <p>value: {value}</p>
          <p>unit: {unit}</p>
          <p>hasMultiValue: {hasMultiValue}</p>
          <p>decimal: {decimal}</p>
          <p>options: {JSON.stringify(options)}</p>
          <button type="button" onClick={() => onChange(8.8)}>
            MockConfigValueDisplayButton
          </button>
        </div>
      )
);

const mockWriteData = jest.fn();
jest.mock('helpers/layer/layer-config-helper', () => ({
  DataType: {
    backlash: 'backlash',
  },
  writeData: (...args) => mockWriteData(...args),
}));

const mockStorage = jest.fn();
jest.mock('implementations/storage', () => ({
  get: (key) => mockStorage(key),
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
    const { getByText } = render(
      <ConfigPanelContext.Provider
        value={{ state: mockContextState as any, dispatch: mockDispatch, selectedLayers: mockSelectedLayers }}
      >
        <Backlash />
      </ConfigPanelContext.Provider>
    );
    expect(mockDispatch).not.toBeCalled();
    expect(mockWriteData).not.toBeCalled();
    fireEvent.click(getByText('MockConfigValueDisplayButton'));
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
