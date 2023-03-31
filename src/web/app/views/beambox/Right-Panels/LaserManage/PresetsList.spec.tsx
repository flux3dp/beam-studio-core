import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import Context from './Context';
import PresetsList from './PresetsList';

jest.mock('app/views/beambox/Right-Panels/LaserManage/Context', () => React.createContext({}));

const mockRead = jest.fn();
jest.mock('app/actions/beambox/beambox-preference', () => ({
  read: (...args) => mockRead(...args),
}));

const mockGet = jest.fn();
jest.mock('implementations/storage', () => ({
  get: (...args) => mockGet(...args),
}));

jest.mock('helpers/useI18n', () => () => ({
  beambox: {
    right_panel: {
      laser_panel: {
        default: 'default',
        inuse: 'inuse',
        dropdown: {
          mm: {
            preset1: 'preset1',
            preset2: 'preset2',
          },
        },
      },
    },
  },
}));

const mockGetParametersSet = jest.fn();
jest.mock('app/constants/right-panel-constants', () => ({
  getParametersSet: (...args) => mockGetParametersSet(...args),
}));

const mockDispatch = jest.fn();
describe('test PresetsList', () => {
  beforeEach(() => {
    mockGet.mockReturnValue('mm');
    mockRead.mockReturnValue('workarea');
    mockGetParametersSet.mockReturnValue({ preset1: {}, preset2: {} });
  });

  it('should render correctly', () => {
    const mockState = {
      selectedItem: { name: 'preset1', isCustomized: false },
      presetsInUse: { preset1: true, preset2: false },
    };
    const { container } = render(
      <Context.Provider value={{ state: mockState as any, dispatch: mockDispatch }}>
        <PresetsList />
      </Context.Provider>
    );
    expect(container).toMatchSnapshot();
    expect(mockGet).toBeCalledTimes(1);
    expect(mockGet).toHaveBeenLastCalledWith('default-units');
    expect(mockRead).toBeCalledTimes(1);
    expect(mockRead).toHaveBeenLastCalledWith('workarea');
    expect(mockGetParametersSet).toBeCalledTimes(1);
    expect(mockGetParametersSet).toHaveBeenLastCalledWith('workarea');
  });

  test('selecting should work', () => {
    const mockState = {
      selectedItem: { name: 'preset1', isCustomized: false },
      presetsInUse: { preset1: true, preset2: false },
    };
    const { getByText } = render(
      <Context.Provider value={{ state: mockState as any, dispatch: mockDispatch }}>
        <PresetsList />
      </Context.Provider>
    );
    expect(mockDispatch).not.toBeCalled();
    fireEvent.click(getByText('preset2'));
    expect(mockDispatch).toBeCalledTimes(1);
    expect(mockDispatch).toHaveBeenLastCalledWith({
      type: 'select', payload: { name: 'preset2', isCustomized: false }
    });
  });
});
