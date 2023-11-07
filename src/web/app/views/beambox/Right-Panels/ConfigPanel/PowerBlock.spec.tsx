import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import ConfigPanelContext from './ConfigPanelContext';
import PowerBlock from './PowerBlock';

jest.mock('helpers/useI18n', () => () => ({
  beambox: {
    right_panel: {
      laser_panel: {
        strength: 'strength',
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
          <button type="button" onClick={() => onChange(88)}>
            MockConfigValueDisplayButton
          </button>
        </div>
      )
);

const mockWriteData = jest.fn();
jest.mock('helpers/layer/layer-config-helper', () => ({
  CUSTOM_PRESET_CONSTANT: 'CUSTOM_PRESET_CONSTANT',
  DataType: {
    strength: 'power',
    configName: 'configName',
  },
  writeData: (...args) => mockWriteData(...args),
}));

const mockSelectedLayers = ['layer1', 'layer2'];
const mockContextState = {
  power: { value: 87, hasMultiValue: false },
};
const mockDispatch = jest.fn();

describe('test PowerBlock', () => {
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
        <PowerBlock />
      </ConfigPanelContext.Provider>
    );
    expect(container).toMatchSnapshot();
  });

  it('should render correctly when type is panel-item', () => {
    const { container } = render(
      <ConfigPanelContext.Provider
        value={{
          state: mockContextState as any,
          dispatch: mockDispatch,
          selectedLayers: mockSelectedLayers,
        }}
      >
        <PowerBlock type="panel-item" />
      </ConfigPanelContext.Provider>
    );
    expect(container).toMatchSnapshot();
  });

  it('should render correctly whe power is low', () => {
    const state = {
      ...mockContextState,
      power: { value: 7 },
    } as any;
    const { container } = render(
      <ConfigPanelContext.Provider
        value={{ state, dispatch: mockDispatch, selectedLayers: mockSelectedLayers }}
      >
        <PowerBlock />
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
        <PowerBlock />
      </ConfigPanelContext.Provider>
    );
    expect(mockDispatch).not.toBeCalled();
    expect(mockWriteData).not.toBeCalled();
    const input = container.querySelector('input');
    fireEvent.change(input, { target: { value: '88' } });
    expect(mockDispatch).toBeCalledTimes(1);
    expect(mockDispatch).toHaveBeenLastCalledWith({
      type: 'change',
      payload: { power: 88, configName: 'CUSTOM_PRESET_CONSTANT' },
    });
    expect(mockWriteData).toBeCalledTimes(4);
    expect(mockWriteData).toHaveBeenNthCalledWith(1, 'layer1', 'power', 88);
    expect(mockWriteData).toHaveBeenNthCalledWith(
      2,
      'layer1',
      'configName',
      'CUSTOM_PRESET_CONSTANT'
    );
    expect(mockWriteData).toHaveBeenNthCalledWith(3, 'layer2', 'power', 88);
    expect(mockWriteData).toHaveBeenNthCalledWith(
      4,
      'layer2',
      'configName',
      'CUSTOM_PRESET_CONSTANT'
    );
  });

  test('onChange of value display should work correctly', () => {
    const { getByText } = render(
      <ConfigPanelContext.Provider
        value={{
          state: mockContextState as any,
          dispatch: mockDispatch,
          selectedLayers: mockSelectedLayers,
        }}
      >
        <PowerBlock type="modal" />
      </ConfigPanelContext.Provider>
    );
    expect(getByText('type: modal')).toBeInTheDocument();
    expect(mockDispatch).not.toBeCalled();
    expect(mockWriteData).not.toBeCalled();
    fireEvent.click(getByText('MockConfigValueDisplayButton'));
    expect(mockDispatch).toBeCalledTimes(1);
    expect(mockDispatch).toHaveBeenLastCalledWith({
      type: 'change',
      payload: { power: 88, configName: 'CUSTOM_PRESET_CONSTANT' },
    });
    expect(mockWriteData).not.toBeCalled();
  });
});
