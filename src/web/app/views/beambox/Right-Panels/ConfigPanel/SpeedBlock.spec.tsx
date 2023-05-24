import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import ConfigPanelContext from './ConfigPanelContext';
import SpeedBlock from './SpeedBlock';

jest.mock('helpers/useI18n', () => () => ({
  beambox: {
    right_panel: {
      laser_panel: {
        speed: 'speed',
        speed_contrain_warning: 'speed_contrain_warning',
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
  CUSTOM_PRESET_CONSTANT: 'CUSTOM_PRESET_CONSTANT',
  DataType: {
    speed: 'speed',
    configName: 'configName',
  },
  writeData: (...args) => mockWriteData(...args),
}));

const mockDoLayersContainsVector = jest.fn();
jest.mock('helpers/layer/check-vector', () => (...args) => mockDoLayersContainsVector(...args));

const mockStorageGet = jest.fn();
jest.mock('implementations/storage', () => ({
  get: (...args) => mockStorageGet(...args),
}));

const mockPrefRead = jest.fn();
jest.mock('app/actions/beambox/beambox-preference', () => ({
  read: (...args) => mockPrefRead(...args),
}));

const mockSelectedLayers = ['layer1', 'layer2'];
const mockContextState = {
  speed: { value: 87, hasMultiValue: false },
};
const mockDispatch = jest.fn();

const mockCreateEventEmitter = jest.fn();
jest.mock('helpers/eventEmitterFactory', () => ({
  createEventEmitter: (...args) => mockCreateEventEmitter(...args),
}));
const mockEmit = jest.fn();

describe('test SpeedBlock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateEventEmitter.mockReturnValueOnce({
      emit: mockEmit,
    });
  });

  it('should render correctly when unit is mm', () => {
    mockStorageGet.mockReturnValueOnce('mm');
    mockPrefRead.mockReturnValueOnce('fbm1').mockReturnValueOnce(true).mockReturnValueOnce(true);
    mockDoLayersContainsVector.mockReturnValue(false);
    const { container } = render(
      <ConfigPanelContext.Provider
        value={{ state: mockContextState as any, dispatch: mockDispatch, selectedLayers: mockSelectedLayers }}
      >
        <SpeedBlock />
      </ConfigPanelContext.Provider>
    );
    expect(mockDoLayersContainsVector).toBeCalledTimes(1);
    expect(mockDoLayersContainsVector).toHaveBeenLastCalledWith(['layer1', 'layer2']);
    expect(mockStorageGet).toBeCalledTimes(1);
    expect(mockStorageGet).toHaveBeenLastCalledWith('default-units');
    expect(mockPrefRead).toBeCalledTimes(2);
    expect(mockPrefRead).toHaveBeenNthCalledWith(1, 'workarea');
    expect(mockPrefRead).toHaveBeenNthCalledWith(2, 'enable-low-speed');
    expect(container).toMatchSnapshot();
  });

  it('should render correctly when unit is inches', () => {
    mockStorageGet.mockReturnValueOnce('inches');
    mockPrefRead.mockReturnValueOnce('fbm1').mockReturnValueOnce(true).mockReturnValueOnce(true);
    mockDoLayersContainsVector.mockReturnValue(false);
    const { container } = render(
      <ConfigPanelContext.Provider
        value={{ state: mockContextState as any, dispatch: mockDispatch, selectedLayers: mockSelectedLayers }}
      >
        <SpeedBlock />
      </ConfigPanelContext.Provider>
    );
    expect(container).toMatchSnapshot();
  });

  it('should render correctly when has vector warning', () => {
    mockStorageGet.mockReturnValueOnce('mm');
    mockPrefRead.mockReturnValueOnce('fhex1').mockReturnValueOnce(true).mockReturnValueOnce(true);
    mockDoLayersContainsVector.mockReturnValue(true);
    const { container } = render(
      <ConfigPanelContext.Provider
        value={{ state: mockContextState as any, dispatch: mockDispatch, selectedLayers: mockSelectedLayers }}
      >
        <SpeedBlock />
      </ConfigPanelContext.Provider>
    );
    expect(container).toMatchSnapshot();
    expect(mockPrefRead).toBeCalledTimes(3);
    expect(mockPrefRead).toHaveBeenNthCalledWith(1, 'workarea');
    expect(mockPrefRead).toHaveBeenNthCalledWith(2, 'enable-low-speed');
    expect(mockPrefRead).toHaveBeenNthCalledWith(3, 'vector_speed_contraint');
  });

  it('should render correctly when has low speed warning', () => {
    mockStorageGet.mockReturnValueOnce('mm');
    mockPrefRead.mockReturnValueOnce('fhex1').mockReturnValueOnce(true).mockReturnValueOnce(true);
    mockDoLayersContainsVector.mockReturnValue(true);
    const state = { ...mockContextState, speed: { value: 1 } };
    const { container } = render(
      <ConfigPanelContext.Provider
        value={{ state: state as any, dispatch: mockDispatch, selectedLayers: mockSelectedLayers }}
      >
        <SpeedBlock />
      </ConfigPanelContext.Provider>
    );
    expect(container).toMatchSnapshot();
    expect(mockPrefRead).toBeCalledTimes(2);
    expect(mockPrefRead).toHaveBeenNthCalledWith(1, 'workarea');
    expect(mockPrefRead).toHaveBeenNthCalledWith(2, 'enable-low-speed');
  });

  test('onChange should work', () => {
    mockStorageGet.mockReturnValueOnce('mm');
    mockPrefRead.mockReturnValueOnce('fbm1').mockReturnValueOnce(true).mockReturnValueOnce(true);
    mockDoLayersContainsVector.mockReturnValue(false);
    const { container } = render(
      <ConfigPanelContext.Provider
        value={{ state: mockContextState as any, dispatch: mockDispatch, selectedLayers: mockSelectedLayers }}
      >
        <SpeedBlock />
      </ConfigPanelContext.Provider>
    );
    expect(mockCreateEventEmitter).toBeCalledTimes(1);
    expect(mockCreateEventEmitter).toHaveBeenLastCalledWith('time-estimation-button');

    expect(mockDispatch).not.toBeCalled();
    expect(mockWriteData).not.toBeCalled();
    expect(mockEmit).not.toBeCalled();
    const input = container.querySelector('input');
    fireEvent.change(input, { target: { value: '88' } });
    expect(mockDispatch).toBeCalledTimes(1);
    expect(mockDispatch).toHaveBeenLastCalledWith({
      type: 'change',
      payload: { speed: 88, configName: 'CUSTOM_PRESET_CONSTANT' },
    });
    expect(mockWriteData).toBeCalledTimes(4);
    expect(mockWriteData).toHaveBeenNthCalledWith(1, 'layer1', 'speed', 88);
    expect(mockWriteData).toHaveBeenNthCalledWith(2, 'layer1', 'configName', 'CUSTOM_PRESET_CONSTANT');
    expect(mockWriteData).toHaveBeenNthCalledWith(3, 'layer2', 'speed', 88);
    expect(mockWriteData).toHaveBeenNthCalledWith(4, 'layer2', 'configName', 'CUSTOM_PRESET_CONSTANT');
    expect(mockEmit).toBeCalledTimes(1);
    expect(mockEmit).toHaveBeenLastCalledWith('SET_ESTIMATED_TIME', null);
  });
});
