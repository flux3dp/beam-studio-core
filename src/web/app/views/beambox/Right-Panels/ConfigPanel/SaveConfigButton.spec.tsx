/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import ConfigPanelContext from './ConfigPanelContext';
import SaveConfigButton from './SaveConfigButton';

const mockPopUp = jest.fn();
jest.mock('app/actions/alert-caller', () => ({
  popUp: (...args) => mockPopUp(...args),
}));

const mockPromptDialog = jest.fn();
jest.mock('app/actions/dialog-caller', () => ({
  promptDialog: (...args) => mockPromptDialog(...args),
}));

const mockGet = jest.fn();
const mockSet = jest.fn();
jest.mock('implementations/storage', () => ({
  get: (...args) => mockGet(...args),
  set: (...args) => mockSet(...args),
}));

jest.mock('helpers/useI18n', () => () => ({
  beambox: {
    right_panel: {
      laser_panel: {
        existing_name: 'existing_name',
        dropdown: {
          save: 'save',
        },
      },
    },
  },
}));

const mockWriteData = jest.fn();
jest.mock('helpers/layer/layer-config-helper', () => ({
  DataType: {
    configName: 'configName',
  },
  writeData: (...args) => mockWriteData(...args),
}));

const mockSelectedLayers = ['layer1'];
const mockContextState = {
  speed: { value: 87, hasMultiValue: false },
  power: { value: 77, hasMultiValue: false },
  repeat: { value: 1, hasMultiValue: false },
  zStep: { value: 0.1, hasMultiValue: false },
};
const mockDispatch = jest.fn();
const mockInitState = jest.fn();

describe('test SaveConfigButton', () => {
  it('should render correctly', () => {
    const { container } = render(
      <ConfigPanelContext.Provider
        value={{
          selectedLayers: mockSelectedLayers,
          state: mockContextState as any,
          dispatch: mockDispatch,
          initState: mockInitState,
        }}
      >
        <SaveConfigButton />
      </ConfigPanelContext.Provider>
    );
    expect(container).toMatchSnapshot();
  });

  test('button should work when customized config is empty', () => {
    const { container } = render(
      <ConfigPanelContext.Provider
        value={{
          selectedLayers: mockSelectedLayers,
          state: mockContextState as any,
          dispatch: mockDispatch,
          initState: mockInitState,
        }}
      >
        <SaveConfigButton />
      </ConfigPanelContext.Provider>
    );
    expect(mockPromptDialog).not.toBeCalled();
    const btn = container.querySelector('.btn');
    fireEvent.click(btn);
    expect(mockPromptDialog).toBeCalledTimes(1);

    const handleSaveConfig = mockPromptDialog.mock.calls[0][0].onYes;
    expect(mockGet).not.toBeCalled();
    expect(mockSet).not.toBeCalled();
    expect(mockWriteData).not.toBeCalled();
    expect(mockDispatch).not.toBeCalled();
    mockGet.mockReturnValueOnce([]);
    handleSaveConfig('new_config_name');
    expect(mockSet).toBeCalledTimes(1);
    expect(mockSet).toHaveBeenLastCalledWith('customizedLaserConfigs', [{
      name: 'new_config_name',
      speed: 87,
      power: 77,
      repeat: 1,
      zStep: 0.1,
    }]);
    expect(mockWriteData).toBeCalledTimes(1);
    expect(mockWriteData).toHaveBeenLastCalledWith('layer1', 'configName', 'new_config_name');
    expect(mockDispatch).toBeCalledTimes(1);
    expect(mockDispatch).toHaveBeenLastCalledWith({ type: 'rename', payload: 'new_config_name' });
  });
});
