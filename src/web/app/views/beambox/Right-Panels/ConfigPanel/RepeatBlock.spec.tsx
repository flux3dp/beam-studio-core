import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import ConfigPanelContext from './ConfigPanelContext';
import RepeatBlock from './RepeatBlock';

jest.mock('helpers/useI18n', () => () => ({
  beambox: {
    right_panel: {
      laser_panel: {
        repeat: 'repeat',
      },
    },
  },
}));

jest.mock('app/widgets/Unit-Input-v2', () => (
  { id, min, max, unit, defaultValue, decimal, displayMultiValue, getValue }: any
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
    <button type="button" onClick={() => getValue(7)}>change</button>
  </div>
));

const mockWriteData = jest.fn();
jest.mock('helpers/layer/layer-config-helper', () => ({
  CUSTOM_PRESET_CONSTANT: 'CUSTOM_PRESET_CONSTANT',
  DataType: {
    repeat: 'repeat',
    configName: 'configName',
  },
  writeData: (...args) => mockWriteData(...args),
}));

const mockSelectedLayers = ['layer1', 'layer2'];
const mockContextState = {
  repeat: { value: 3, hasMultiValue: false },
};
const mockDispatch = jest.fn();

const mockCreateEventEmitter = jest.fn();
jest.mock('helpers/eventEmitterFactory', () => ({
  createEventEmitter: (...args) => mockCreateEventEmitter(...args),
}));
const mockEmit = jest.fn();

describe('test RepeatBlock', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockCreateEventEmitter.mockReturnValueOnce({
      emit: mockEmit,
    });
  });

  it('should render correctly', () => {
    const { container } = render(
      <ConfigPanelContext.Provider
        value={{ state: mockContextState as any, dispatch: mockDispatch, selectedLayers: mockSelectedLayers }}
      >
        <RepeatBlock />
      </ConfigPanelContext.Provider>
    );
    expect(container).toMatchSnapshot();
  });

  test('onChange should work', () => {
    expect(mockCreateEventEmitter).not.toBeCalled();

    const { getByText } = render(
      <ConfigPanelContext.Provider
        value={{ state: mockContextState as any, dispatch: mockDispatch, selectedLayers: mockSelectedLayers }}
      >
        <RepeatBlock />
      </ConfigPanelContext.Provider>
    );
    expect(mockCreateEventEmitter).toBeCalledTimes(1);
    expect(mockCreateEventEmitter).toHaveBeenLastCalledWith('time-estimation-button');

    expect(mockDispatch).not.toBeCalled();
    expect(mockWriteData).not.toBeCalled();
    expect(mockEmit).not.toBeCalled();
    fireEvent.click(getByText('change'));
    expect(mockDispatch).toBeCalledTimes(1);
    expect(mockDispatch).toHaveBeenLastCalledWith({
      type: 'change',
      payload: { repeat: 7, configName: 'CUSTOM_PRESET_CONSTANT' },
    });
    expect(mockWriteData).toBeCalledTimes(4);
    expect(mockWriteData).toHaveBeenNthCalledWith(1, 'layer1', 'repeat', 7);
    expect(mockWriteData).toHaveBeenNthCalledWith(2, 'layer1', 'configName', 'CUSTOM_PRESET_CONSTANT');
    expect(mockWriteData).toHaveBeenNthCalledWith(3, 'layer2', 'repeat', 7);
    expect(mockWriteData).toHaveBeenNthCalledWith(4, 'layer2', 'configName', 'CUSTOM_PRESET_CONSTANT');
    expect(mockEmit).toBeCalledTimes(1);
    expect(mockEmit).toHaveBeenLastCalledWith('SET_ESTIMATED_TIME', null);
  });
});
