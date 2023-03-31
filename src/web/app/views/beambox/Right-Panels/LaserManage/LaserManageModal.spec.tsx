import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import { getInitState, reducer } from './Context';
import LaserManageModal from './LaserManageModal';

jest.mock('app/views/beambox/Right-Panels/LaserManage/Context', () => {
  const module: any = React.createContext({});
  module.getInitState = jest.fn();
  module.reducer = jest.fn();
  return module;
});

const mockPopUp = jest.fn();
jest.mock('app/actions/alert-caller', () => ({
  popUp: (...args) => mockPopUp(...args),
}));

const mockRemoveAt = jest.fn();
const mockSet = jest.fn();
jest.mock('implementations/storage', () => ({
  removeAt: (...args) => mockRemoveAt(...args),
  set: (...args) => mockSet(...args),
}));

const mockUpdateDefaultPresetData = jest.fn();
jest.mock('helpers/presets/preset-helper', () => ({
  updateDefaultPresetData: (...args) => mockUpdateDefaultPresetData(...args),
}));

jest.mock('helpers/useI18n', () => () => ({
  beambox: {
    right_panel: {
      laser_panel: {
        more: 'more',
      },
    },
  },
}));

jest.mock('app/views/beambox/Right-Panels/LaserManage/ArrowButtons', () => () => (
  <div>Dummy ArrowButtons</div>
));

jest.mock('app/views/beambox/Right-Panels/LaserManage/CustomConfigs', () => () => (
  <div>Dummy CustomConfigs</div>
));

jest.mock('app/views/beambox/Right-Panels/LaserManage/Inputs', () => () => (
  <div>Dummy Inputs</div>
));

jest.mock('app/views/beambox/Right-Panels/LaserManage/PresetsList', () => () => (
  <div>Dummy PresetsList</div>
));

jest.mock('app/views/beambox/Right-Panels/LaserManage/Footer', () => (
  { onClose, onDelete, onReset, onSave }: any
) => (
  <div>
    Dummy Footer
    <button type="button" onClick={onClose}>close</button>
    <button type="button" onClick={onDelete}>delete</button>
    <button type="button" onClick={onReset}>reset</button>
    <button type="button" onClick={onSave}>save</button>
  </div>
));

const mockGetInitState = getInitState as jest.Mock<any, any>;
const mockReducer = reducer as jest.Mock<any, any>;

const mockOnClose = jest.fn();
const mockOnSave = jest.fn();
describe('test LaserManageModal', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should render correctly', () => {
    const { baseElement } = render(
      <LaserManageModal selectedItem="preset" onClose={mockOnClose} onSave={mockOnSave} />
    );
    expect(mockGetInitState).toBeCalledTimes(1);
    expect(mockGetInitState).toHaveBeenLastCalledWith('preset');
    expect(baseElement).toMatchSnapshot();
  });

  test('footer onClose should work', () => {
    mockGetInitState.mockReturnValue('state');
    mockReducer.mockReturnValue('state');
    const { getByText } = render(
      <LaserManageModal selectedItem="preset" onClose={mockOnClose} onSave={mockOnSave} />
    );
    expect(mockOnClose).not.toBeCalled();
    fireEvent.click(getByText('close'));
    expect(mockOnClose).toBeCalledTimes(1);
  });

  test('footer onDelete should work', () => {
    mockGetInitState.mockReturnValue('state');
    mockReducer.mockReturnValue('state');
    const { getByText } = render(
      <LaserManageModal selectedItem="preset" onClose={mockOnClose} onSave={mockOnSave} />
    );

    expect(mockReducer).not.toBeCalled();
    fireEvent.click(getByText('delete'));
    expect(mockReducer).toBeCalledTimes(1);
    expect(mockReducer).toHaveBeenLastCalledWith('state', { type: 'delete' });
  });

  test('footer onReset should work', () => {
    mockGetInitState.mockReturnValue('state');
    mockReducer.mockReturnValue('state');
    const { getByText } = render(
      <LaserManageModal selectedItem="preset" onClose={mockOnClose} onSave={mockOnSave} />
    );

    expect(mockPopUp).not.toBeCalled();
    fireEvent.click(getByText('reset'));
    expect(mockPopUp).toBeCalledTimes(1);

    const { onYes } = mockPopUp.mock.calls[0][0];
    expect(mockRemoveAt).not.toBeCalled();
    expect(mockUpdateDefaultPresetData).not.toBeCalled();
    expect(mockReducer).not.toBeCalled();
    onYes();
    expect(mockRemoveAt).toBeCalledTimes(1);
    expect(mockRemoveAt).toHaveBeenLastCalledWith('defaultLaserConfigsInUse');
    expect(mockUpdateDefaultPresetData).toBeCalledTimes(1);
    expect(mockReducer).toBeCalledTimes(1);
    expect(mockReducer).toHaveBeenLastCalledWith('state', { type: 'reset' });
  });

  test('footer onSave should work', () => {
    mockGetInitState.mockReturnValue({
      configs: [{ name: 'preset' }],
      dataChanges: { preset: { data: 'd' } },
      presetsInUse: 'presetsInUse',
    });
    const { getByText } = render(
      <LaserManageModal selectedItem="preset" onClose={mockOnClose} onSave={mockOnSave} />
    );
    expect(mockSet).not.toBeCalled();
    expect(mockOnSave).not.toBeCalled();
    expect(mockOnClose).not.toBeCalled();
    fireEvent.click(getByText('save'));
    expect(mockSet).toBeCalledTimes(2);
    expect(mockSet).toHaveBeenNthCalledWith(1, 'customizedLaserConfigs', [{ name: 'preset', data: 'd' }]);
    expect(mockSet).toHaveBeenNthCalledWith(2, 'defaultLaserConfigsInUse', 'presetsInUse');
    expect(mockOnSave).toBeCalledTimes(1);
    expect(mockOnClose).toBeCalledTimes(1);
  });
});
