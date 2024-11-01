/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import ConfigPanelContext from './ConfigPanelContext';

const mockGet = jest.fn();
jest.mock('implementations/storage', () => ({
  get: (...args) => mockGet(...args),
}));

const mockWriteData = jest.fn();
jest.mock('helpers/layer/layer-config-helper', () => ({
  CUSTOM_PRESET_CONSTANT: 'CUSTOM_PRESET_CONSTANT',
  writeData: (...args) => mockWriteData(...args),
}));

const mockAddCommandToHistory = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync: (callback) =>
    callback({
      Canvas: {
        addCommandToHistory: mockAddCommandToHistory,
      },
    }),
}));

let batchCmd = { onAfter: undefined, count: 0 };
const mockBatchCommand = jest.fn().mockImplementation(() => {
  batchCmd = { onAfter: undefined, count: batchCmd.count + 1 };
  return batchCmd;
});
jest.mock('app/svgedit/history/history', () => ({
  BatchCommand: mockBatchCommand,
}));

const mockSelectedLayers = ['layer1', 'layer2'];
const mockContextState = { fillInterval: { value: 87, hasMultiValue: false } };
const mockDispatch = jest.fn();
const mockInitState = jest.fn();

jest.mock('app/views/beambox/Right-Panels/contexts/ObjectPanelContext', () => ({
  ObjectPanelContext: React.createContext({ activeKey: null }),
}));

jest.mock(
  'app/widgets/Unit-Input-v2',
  () =>
    ({ id, min, max, unit, defaultValue, decimal, displayMultiValue, getValue }: any) =>
      (
        <div>
          MockUnitInput
          <p>min: {min}</p>
          <p>max: {max}</p>
          <p>unit: {unit}</p>
          <p>defaultValue: {defaultValue}</p>
          <p>decimal: {decimal}</p>
          <p>displayMultiValue: {displayMultiValue ? 'Y' : 'N'}</p>
          <input
            id={id}
            data-testid={id}
            type="number"
            value={defaultValue}
            onChange={(e) => getValue(parseFloat(e.target.value))}
          />
        </div>
      )
);

// eslint-disable-next-line import/first
import FillIntervalBlock from './FillIntervalBlock';

describe('test FillIntervalBlock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReturnValue('mm');
    batchCmd = { onAfter: undefined, count: 0 };
  });

  it('should render correctly', () => {
    const { container } = render(
      <ConfigPanelContext.Provider
        value={{
          state: mockContextState as any,
          dispatch: mockDispatch,
          selectedLayers: mockSelectedLayers,
          initState: mockInitState,
        }}
      >
        <FillIntervalBlock />
      </ConfigPanelContext.Provider>
    );
    expect(container).toMatchSnapshot();
  });

  it('should render correctly when unit is inch', () => {
    mockGet.mockReturnValue('inches');
    const { container } = render(
      <ConfigPanelContext.Provider
        value={{
          state: mockContextState as any,
          dispatch: mockDispatch,
          selectedLayers: mockSelectedLayers,
          initState: mockInitState,
        }}
      >
        <FillIntervalBlock />
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
          initState: mockInitState,
        }}
      >
        <FillIntervalBlock type="panel-item" />
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
          initState: mockInitState,
        }}
      >
        <FillIntervalBlock />
      </ConfigPanelContext.Provider>
    );
    expect(mockDispatch).not.toBeCalled();
    expect(mockWriteData).not.toBeCalled();
    expect(mockBatchCommand).not.toBeCalled();
    expect(batchCmd.count).toBe(0);
    const input = container.querySelector('input');
    fireEvent.change(input, { target: { value: '88' } });
    expect(mockDispatch).toBeCalledTimes(1);
    expect(mockDispatch).toHaveBeenLastCalledWith({
      type: 'change',
      payload: { fillInterval: 88, configName: 'CUSTOM_PRESET_CONSTANT' },
    });
    expect(mockBatchCommand).toBeCalledTimes(1);
    expect(mockBatchCommand).lastCalledWith('Change fillInterval');
    expect(batchCmd.count).toBe(1);
    expect(mockWriteData).toBeCalledTimes(4);
    expect(mockWriteData).toHaveBeenNthCalledWith(1, 'layer1', 'fillInterval', 88, { batchCmd });
    expect(mockWriteData).toHaveBeenNthCalledWith(
      2,
      'layer1',
      'configName',
      'CUSTOM_PRESET_CONSTANT',
      { batchCmd }
    );
    expect(mockWriteData).toHaveBeenNthCalledWith(3, 'layer2', 'fillInterval', 88, { batchCmd });
    expect(mockWriteData).toHaveBeenNthCalledWith(
      4,
      'layer2',
      'configName',
      'CUSTOM_PRESET_CONSTANT',
      { batchCmd }
    );
    expect(batchCmd.onAfter).toBe(mockInitState);
    expect(mockAddCommandToHistory).toBeCalledTimes(1);
    expect(mockAddCommandToHistory).lastCalledWith(batchCmd);
  });

  test('onChange should work correctly when type is modal', () => {
    const { container } = render(
      <ConfigPanelContext.Provider
        value={{
          state: mockContextState as any,
          dispatch: mockDispatch,
          selectedLayers: mockSelectedLayers,
          initState: mockInitState,
        }}
      >
        <FillIntervalBlock type="modal" />
      </ConfigPanelContext.Provider>
    );

    expect(mockDispatch).not.toBeCalled();
    expect(mockWriteData).not.toBeCalled();
    expect(mockBatchCommand).not.toBeCalled();
    expect(batchCmd.count).toBe(0);
    const input = container.querySelector('input');
    fireEvent.change(input, { target: { value: '88' } });
    expect(mockDispatch).toBeCalledTimes(1);
    expect(mockDispatch).toHaveBeenLastCalledWith({
      type: 'change',
      payload: { fillInterval: 88, configName: 'CUSTOM_PRESET_CONSTANT' },
    });
    expect(mockWriteData).not.toBeCalled();
    expect(mockBatchCommand).not.toBeCalled();
    expect(batchCmd.count).toBe(0);
  });
});
