/* eslint-disable @typescript-eslint/no-explicit-any */ // for mock context
import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import { ObjectPanelContext } from 'app/views/beambox/Right-Panels/contexts/ObjectPanelContext';

import ConfigPanelContext from './ConfigPanelContext';
import MultipassBlock from './MultipassBlock';

jest.mock('helpers/useI18n', () => () => ({
  beambox: {
    right_panel: {
      laser_panel: {
        print_multipass: 'multipass',
        times: 'times',
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
          <button type="button" onClick={() => onChange(10)}>
            MockConfigValueDisplayButton
          </button>
        </div>
      )
);

jest.mock('app/views/beambox/Right-Panels/contexts/ObjectPanelContext', () => ({
  ObjectPanelContext: React.createContext({ activeKey: null }),
}));

jest.mock('app/views/beambox/Right-Panels/ObjectPanelItem', () => ({
  Item: ({ id, content, label, onClick }: any) => (
    <div onClick={onClick}>
      MockObjectPanelItem
      <div>id: {id}</div>
      <div>content: {content}</div>
      <div>label: {label}</div>
    </div>
  ),
}));

const mockWriteData = jest.fn();
jest.mock('helpers/layer/layer-config-helper', () => ({
  CUSTOM_PRESET_CONSTANT: 'CUSTOM_PRESET_CONSTANT',
  DataType: {
    multipass: 'multipass',
    configName: 'configName',
  },
  writeData: (...args) => mockWriteData(...args),
}));

const mockSelectedLayers = ['layer1', 'layer2'];
const mockContextState = {
  multipass: { value: 8, hasMultiValue: false },
};
const mockDispatch = jest.fn();

const mockCreateEventEmitter = jest.fn();
jest.mock('helpers/eventEmitterFactory', () => ({
  createEventEmitter: (...args) => mockCreateEventEmitter(...args),
}));
const mockEmit = jest.fn();

describe('test MultipassBlock when type is not panel-item', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateEventEmitter.mockReturnValueOnce({
      emit: mockEmit,
    });
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
        <MultipassBlock />
      </ConfigPanelContext.Provider>
    );
    expect(container).toMatchSnapshot();
  });

  test('edit value with slider', () => {
    const { container } = render(
      <ConfigPanelContext.Provider
        value={{
          state: mockContextState as any,
          dispatch: mockDispatch,
          selectedLayers: mockSelectedLayers,
        }}
      >
        <MultipassBlock />
      </ConfigPanelContext.Provider>
    );
    const slider = container.querySelector('.mock-config-slider');
    fireEvent.change(slider, { target: { value: 7 } });
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenLastCalledWith({
      type: 'change',
      payload: { multipass: 7, configName: 'CUSTOM_PRESET_CONSTANT' },
    });
    expect(mockEmit).toBeCalledTimes(1);
    expect(mockEmit).toHaveBeenLastCalledWith('SET_ESTIMATED_TIME', null);
    expect(mockWriteData).toHaveBeenCalledTimes(4);
    expect(mockWriteData).toHaveBeenNthCalledWith(1, 'layer1', 'multipass', 7);
    expect(mockWriteData).toHaveBeenNthCalledWith(
      2,
      'layer1',
      'configName',
      'CUSTOM_PRESET_CONSTANT'
    );
    expect(mockWriteData).toHaveBeenNthCalledWith(3, 'layer2', 'multipass', 7);
    expect(mockWriteData).toHaveBeenNthCalledWith(
      4,
      'layer2',
      'configName',
      'CUSTOM_PRESET_CONSTANT'
    );
  });

  test('edit value with value display', () => {
    const { getByText } = render(
      <ConfigPanelContext.Provider
        value={{
          state: mockContextState as any,
          dispatch: mockDispatch,
          selectedLayers: mockSelectedLayers,
        }}
      >
        <MultipassBlock />
      </ConfigPanelContext.Provider>
    );
    const button = getByText('MockConfigValueDisplayButton');
    fireEvent.click(button);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenLastCalledWith({
      type: 'change',
      payload: { multipass: 10, configName: 'CUSTOM_PRESET_CONSTANT' },
    });
    expect(mockEmit).toBeCalledTimes(1);
    expect(mockEmit).toHaveBeenLastCalledWith('SET_ESTIMATED_TIME', null);
    expect(mockWriteData).toHaveBeenCalledTimes(4);
    expect(mockWriteData).toHaveBeenNthCalledWith(1, 'layer1', 'multipass', 10);
    expect(mockWriteData).toHaveBeenNthCalledWith(
      2,
      'layer1',
      'configName',
      'CUSTOM_PRESET_CONSTANT'
    );
    expect(mockWriteData).toHaveBeenNthCalledWith(3, 'layer2', 'multipass', 10);
    expect(mockWriteData).toHaveBeenNthCalledWith(
      4,
      'layer2',
      'configName',
      'CUSTOM_PRESET_CONSTANT'
    );
  });
});

describe('test MultipassBlock when type is panel-item', () => {
  it('should render correctly when visible', () => {
    const { container } = render(
      <ObjectPanelContext.Provider value={{ activeKey: 'multipass' } as any}>
        <ConfigPanelContext.Provider
          value={{
            state: mockContextState as any,
            dispatch: mockDispatch,
            selectedLayers: mockSelectedLayers,
          }}
        >
          <MultipassBlock type="panel-item" />
        </ConfigPanelContext.Provider>
      </ObjectPanelContext.Provider>
    );
    expect(container).toMatchSnapshot();
  });
});
