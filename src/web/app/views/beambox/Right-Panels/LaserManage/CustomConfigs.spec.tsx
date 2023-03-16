import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import Context from './Context';
import CustomConfigs from './CustomConfigs';

jest.mock('app/views/beambox/Right-Panels/LaserManage/Context', () => React.createContext({}));

const mockPopUpError = jest.fn();
jest.mock('app/actions/alert-caller', () => ({
  popUpError: (...args) => mockPopUpError(...args),
}));

const mockPromptDialog = jest.fn();
jest.mock('app/actions/dialog-caller', () => ({
  promptDialog: (...args) => mockPromptDialog(...args),
}));

jest.mock('helpers/useI18n', () => () => ({
  beambox: {
    right_panel: {
      laser_panel: {
        customized: 'customized',
        default: 'default',
      },
    },
  },
}));

const mockDispatch = jest.fn();
describe('test PresetsList', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should render correctly', () => {
    const mockState = {
      selectedItem: { name: 'preset1', isCustomized: true },
      configs: [{ name: 'preset1', isDefault: true }, { name: 'preset2', isDefault: false }],
      dataChanges: { preset2: { speed: 10 } },
    };
    const { container } = render(
      <Context.Provider value={{ state: mockState as any, dispatch: mockDispatch }}>
        <CustomConfigs />
      </Context.Provider>
    );
    expect(container).toMatchSnapshot();
  });

  test('selecting should work', () => {
    const mockState = {
      selectedItem: { name: 'preset1', isCustomized: true },
      configs: [{ name: 'preset1', isDefault: true }, { name: 'preset2', isDefault: false }],
      dataChanges: { preset2: { speed: 10 } },
    };
    const { getByText } = render(
      <Context.Provider value={{ state: mockState as any, dispatch: mockDispatch }}>
        <CustomConfigs />
      </Context.Provider>
    );
    expect(mockDispatch).not.toBeCalled();
    fireEvent.click(getByText('preset2 *'));
    expect(mockDispatch).toBeCalledTimes(1);
    expect(mockDispatch).toHaveBeenLastCalledWith({
      type: 'select', payload: { name: 'preset2', isCustomized: true }
    });
  });

  test('add preset button should work', () => {
    const mockState = {
      selectedItem: { name: 'preset1', isCustomized: true },
      configs: [{ name: 'preset1', isDefault: true }, { name: 'preset2', isDefault: false }],
      dataChanges: { preset2: { speed: 10 } },
    };
    const { container } = render(
      <Context.Provider value={{ state: mockState as any, dispatch: mockDispatch }}>
        <CustomConfigs />
      </Context.Provider>
    );
    const addBtn = container.querySelector('button');
    expect(mockPromptDialog).not.toBeCalled();
    fireEvent.click(addBtn);
    expect(mockPromptDialog).toBeCalledTimes(1);
    const { onYes } = mockPromptDialog.mock.calls[0][0];
    expect(mockPopUpError).not.toBeCalled();
    onYes('preset2');
    expect(mockPopUpError).toBeCalledTimes(1);
    expect(mockDispatch).not.toBeCalled();
    onYes('preset3');
    expect(mockDispatch).toBeCalledTimes(1);
    expect(mockDispatch).toHaveBeenLastCalledWith({ type: 'add-config', payload: { name: 'preset3' } });
  });
});
