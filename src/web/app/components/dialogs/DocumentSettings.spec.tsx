import React from 'react';
import { fireEvent, render } from '@testing-library/react';


const mockEventEmitter = {
  emit: jest.fn(),
}
const mockCreateEventEmitter = jest.fn();
jest.mock('helpers/eventEmitterFactory', () => ({
  createEventEmitter: (...args) =>  {
    mockCreateEventEmitter(...args);
    return mockEventEmitter;
  },
}));

// eslint-disable-next-line import/first
import DocumentSettings from './DocumentSettings';

jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  ConfigProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const mockPopUp = jest.fn();
jest.mock('app/actions/alert-caller', () => ({
  popUp: (...args) => mockPopUp(...args),
}));

jest.mock('app/constants/alert-constants', () => ({
  CONFIRM_CANCEL: 'CONFIRM_CANCEL',
}));

const beamboxPreferences = {
  engrave_dpi: 'medium',
  workarea: 'ado1',
  rotary_mode: 0,
  borderless: false,
  'enable-diode': false,
  'enable-autofocus': false,
  'extend-rotary-workarea': undefined,
};
const mockBeamboxPreferenceWrite = jest.fn();
jest.mock('app/actions/beambox/beambox-preference', () => ({
  read: (key) => beamboxPreferences[key],
  write: (key, value) => {
    beamboxPreferences[key] = value;
    mockBeamboxPreferenceWrite(key, value);
  },
}));

jest.mock('app/widgets/EngraveDpiSlider', () => ({ value, onChange }: any) => (
  <div>
    DummyEngraveDpiSlider
    <p>value: {value}</p>
    <button type="button" onClick={() => onChange('high')}>
      change dpi
    </button>
  </div>
));

const update = jest.fn();
jest.mock('app/actions/beambox/open-bottom-boundary-drawer', () => ({
  update: () => update(),
}));

const mockToggleDisplay = jest.fn();
jest.mock('app/actions/canvas/rotary-axis', () => ({
  toggleDisplay: () => mockToggleDisplay(),
}));

const mockTogglePresprayArea = jest.fn();
jest.mock('app/actions/canvas/prespray-area', () => ({
  togglePresprayArea: () => mockTogglePresprayArea(),
}));

jest.mock('helpers/useI18n', () => () => ({
  settings: {
    on: 'on',
    off: 'off',
  },
  beambox: {
    document_panel: {
      document_settings: 'Document Settings',
      engrave_parameters: 'Engraving Parameters',
      workarea: 'Working Area',
      rotary_mode: 'Rotary',
      borderless_mode: 'Open Bottom',
      engrave_dpi: 'Resolution',
      enable_diode: 'Diode Laser',
      enable_autofocus: 'Autofocus',
      extend_workarea: 'extend_workarea',
      pass_through: 'Pass Through',
      add_on: 'Add-ons',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      ultra: 'Ultra High',
      enable: 'Enable',
      disable: 'Disable',
      cancel: 'Cancel',
      save: 'Save',
      notification: {
        changeFromPrintingWorkareaTitle: 'changeFromPrintingWorkareaTitle',
      },
    },
  },
}));

const mockChangeWorkarea = jest.fn();
jest.mock(
  'app/svgedit/operations/changeWorkarea',
  () =>
    (...args) =>
      mockChangeWorkarea(...args)
);

const mockDiodeBoundaryDrawerShow = jest.fn();
const mockDiodeBoundaryDrawerHide = jest.fn();
jest.mock('app/actions/canvas/diode-boundary-drawer', () => ({
  show: () => mockDiodeBoundaryDrawerShow(),
  hide: () => mockDiodeBoundaryDrawerHide(),
}));

const mockUnmount = jest.fn();
const mockQuerySelectorAll = jest.fn();

describe('test DocumentSettings', () => {
  test('should render correctly', async () => {
    document.querySelectorAll = mockQuerySelectorAll;
    const { baseElement, getByText } = render(<DocumentSettings unmount={mockUnmount} />);
    expect(baseElement).toMatchSnapshot();

    fireEvent.click(getByText('change dpi'));
    expect(baseElement).toMatchSnapshot();

    const workareaToggle = baseElement.querySelector('input#workarea');
    fireEvent.mouseDown(workareaToggle);
    fireEvent.click(
      baseElement.querySelectorAll('.ant-slide-up-appear .ant-select-item-option-content')[0]
    );
    fireEvent.click(baseElement.querySelector('button#rotary_mode'));
    fireEvent.click(baseElement.querySelector('button#borderless_mode'));
    fireEvent.click(baseElement.querySelector('button#autofocus-module'));
    fireEvent.click(baseElement.querySelector('button#diode_module'));
    fireEvent.click(baseElement.querySelector('button#pass_through'));
    fireEvent.change(baseElement.querySelector('#pass_through_height'), { target: { value: 500 } });
    expect(baseElement).toMatchSnapshot();

    expect(mockBeamboxPreferenceWrite).not.toBeCalled();
    expect(update).not.toBeCalled();
    expect(mockUnmount).not.toBeCalled();
    expect(mockChangeWorkarea).not.toBeCalled();
    mockQuerySelectorAll.mockReturnValueOnce([1]);
    fireEvent.click(getByText('Save'));
    expect(mockPopUp).toBeCalledTimes(1);
    expect(mockPopUp).toHaveBeenLastCalledWith({
      id: 'save-document-settings',
      message: 'changeFromPrintingWorkareaTitle',
      messageIcon: 'notice',
      buttonType: 'CONFIRM_CANCEL',
      onConfirm: expect.any(Function),
      onCancel: expect.any(Function),
    });
    const { onConfirm } = mockPopUp.mock.calls[0][0];
    onConfirm();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(mockBeamboxPreferenceWrite).toBeCalledTimes(8);
    expect(mockBeamboxPreferenceWrite).toHaveBeenNthCalledWith(1, 'engrave_dpi', 'high');
    expect(mockBeamboxPreferenceWrite).toHaveBeenNthCalledWith(2, 'borderless', true);
    expect(mockBeamboxPreferenceWrite).toHaveBeenNthCalledWith(3, 'enable-diode', true);
    expect(mockBeamboxPreferenceWrite).toHaveBeenNthCalledWith(4, 'enable-autofocus', true);
    expect(mockBeamboxPreferenceWrite).toHaveBeenNthCalledWith(5, 'rotary_mode', 0);
    expect(mockBeamboxPreferenceWrite).toHaveBeenNthCalledWith(6, 'extend-rotary-workarea', false);
    expect(mockBeamboxPreferenceWrite).toHaveBeenNthCalledWith(7, 'pass-through', true);
    expect(mockBeamboxPreferenceWrite).toHaveBeenNthCalledWith(8, 'pass-through-height', 500);
    expect(mockChangeWorkarea).toBeCalledTimes(1);
    expect(mockChangeWorkarea).toHaveBeenLastCalledWith('fbm1', { toggleModule: true });
    expect(mockToggleDisplay).toBeCalledTimes(1);
    expect(mockTogglePresprayArea).toBeCalledTimes(1);
    expect(update).not.toBeCalled();
    expect(mockDiodeBoundaryDrawerShow).toBeCalledTimes(0);
    expect(mockDiodeBoundaryDrawerHide).toBeCalledTimes(0);
    expect(mockCreateEventEmitter).toBeCalledTimes(2);
    expect(mockCreateEventEmitter).toHaveBeenNthCalledWith(1, 'dpi-info');
    expect(mockCreateEventEmitter).toHaveBeenNthCalledWith(2, 'canvas');
    expect(mockEventEmitter.emit).toBeCalledTimes(2);
    expect(mockEventEmitter.emit).toHaveBeenNthCalledWith(1, 'UPDATE_DPI', 'high');
    expect(mockEventEmitter.emit).toHaveBeenNthCalledWith(2, 'document-settings-saved');
    expect(mockUnmount).toBeCalledTimes(1);
  });
});
