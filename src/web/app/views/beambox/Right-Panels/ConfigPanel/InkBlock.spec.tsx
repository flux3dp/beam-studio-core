import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import ConfigPanelContext from './ConfigPanelContext';
import InkBlock from './InkBlock';

jest.mock('helpers/useI18n', () => () => ({
  beambox: {
    right_panel: {
      laser_panel: {
        ink_saturation: 'ink_saturation',
        low_power_warning: 'low_power_warning',
      },
    },
  },
}));

jest.mock('./ConfigSlider', () => ({ id, max, min, value, onChange }: any) => (
  <input
    id={id}
    className="mock-config-slider"
    type="range"
    min={min}
    max={max}
    step={0.1}
    value={value}
    onChange={(e) => onChange(Number(e.target.value))}
  />
));

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
          <button type="button" onClick={() => onChange(8)}>
            MockConfigValueDisplayButton
          </button>
        </div>
      )
);

const mockWriteData = jest.fn();
jest.mock('helpers/layer/layer-config-helper', () => ({
  CUSTOM_PRESET_CONSTANT: 'CUSTOM_PRESET_CONSTANT',
  DataType: {
    ink: 'ink',
    configName: 'configName',
  },
  writeData: (...args) => mockWriteData(...args),
}));

const mockSelectedLayers = ['layer1', 'layer2'];
const mockContextState = {
  ink: { value: 7, hasMultiValue: false },
};
const mockDispatch = jest.fn();

describe('test InkBlock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    const { container } = render(
      <ConfigPanelContext.Provider
        value={{
          state: mockContextState as any,
          dispatch: mockDispatch,
          selectedLayers: mockSelectedLayers,
        }}
      >
        <InkBlock />
      </ConfigPanelContext.Provider>
    );
    expect(container).toMatchSnapshot();
  });

  test('onChange should work', () => {
    const { container } = render(
      <ConfigPanelContext.Provider
        value={{
          state: mockContextState as any,
          dispatch: mockDispatch,
          selectedLayers: mockSelectedLayers,
        }}
      >
        <InkBlock />
      </ConfigPanelContext.Provider>
    );
    expect(mockDispatch).not.toBeCalled();
    expect(mockWriteData).not.toBeCalled();
    const input = container.querySelector('input');
    fireEvent.change(input, { target: { value: '8' } });
    expect(mockDispatch).toBeCalledTimes(1);
    expect(mockDispatch).toHaveBeenLastCalledWith({
      type: 'change',
      payload: { ink: 8 },
    });
    expect(mockWriteData).toBeCalledTimes(2);
    expect(mockWriteData).toHaveBeenNthCalledWith(1, 'layer1', 'ink', 8);
    expect(mockWriteData).toHaveBeenNthCalledWith(2, 'layer2', 'ink', 8);
  });

  test('onChange of value display should work', () => {
    const { getByText } = render(
      <ConfigPanelContext.Provider
        value={{
          state: mockContextState as any,
          dispatch: mockDispatch,
          selectedLayers: mockSelectedLayers,
        }}
      >
        <InkBlock />
      </ConfigPanelContext.Provider>
    );
    expect(mockDispatch).not.toBeCalled();
    expect(mockWriteData).not.toBeCalled();
    fireEvent.click(getByText('MockConfigValueDisplayButton'));
    expect(mockDispatch).toBeCalledTimes(1);
    expect(mockDispatch).toHaveBeenLastCalledWith({
      type: 'change',
      payload: { ink: 8 },
    });
    expect(mockWriteData).toBeCalledTimes(2);
    expect(mockWriteData).toHaveBeenNthCalledWith(1, 'layer1', 'ink', 8);
    expect(mockWriteData).toHaveBeenNthCalledWith(2, 'layer2', 'ink', 8);
  });
});
