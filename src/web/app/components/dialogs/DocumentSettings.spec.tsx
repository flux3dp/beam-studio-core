import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import DocumentSettings from './DocumentSettings';

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
};
const mockBeamboxPreferenceWrite = jest.fn();
jest.mock('app/actions/beambox/beambox-preference', () => ({
  read: (key) => beamboxPreferences[key],
  write: (key, value) => {
    beamboxPreferences[key] = value;
    mockBeamboxPreferenceWrite(key, value);
  },
}));

const emitUpdateWorkArea = jest.fn();
jest.mock('app/stores/beambox-store', () => ({
  emitUpdateWorkArea: () => emitUpdateWorkArea(),
}));

jest.mock('app/widgets/EngraveDpiSlider', () => ({ value, onChange }: any) => (
  <div>
    DummyEngraveDpiSlider
    <p>value: {value}</p>
    <button type="button" onClick={() => onChange('high')}>change dpi</button>
  </div>
));

const update = jest.fn();
jest.mock('app/actions/beambox/open-bottom-boundary-drawer', () => ({
  update: () => update(),
}));

const setRotaryMode = jest.fn();
const runExtensions = jest.fn();
const setResolution = jest.fn();
const resetView = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync: (callback) => {
    callback({
      Canvas: {
        setRotaryMode: (value) => setRotaryMode(value),
        runExtensions: (value) => runExtensions(value),
        setResolution: (w, h) => setResolution(w, h),
      },
      Editor: {
        resetView: () => resetView(),
      },
    });
  },
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

const mockToggleFullColorAfterWorkareaChange = jest.fn();
jest.mock('helpers/layer/layer-config-helper', () => ({
  toggleFullColorAfterWorkareaChange: (...args) => mockToggleFullColorAfterWorkareaChange(...args),
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
    fireEvent.click(baseElement.querySelectorAll('.ant-slide-up-appear .ant-select-item-option-content')[0]);
    fireEvent.click(baseElement.querySelector('button#rotary_mode'));
    fireEvent.click(baseElement.querySelector('button#borderless_mode'));
    fireEvent.click(baseElement.querySelector('button#autofocus-module'));
    fireEvent.click(baseElement.querySelector('button#diode_module'));
    expect(baseElement).toMatchSnapshot();

    expect(mockBeamboxPreferenceWrite).not.toBeCalled();
    expect(setResolution).not.toBeCalled();
    expect(resetView).not.toBeCalled();
    expect(update).not.toBeCalled();
    expect(emitUpdateWorkArea).not.toBeCalled();
    expect(mockUnmount).not.toBeCalled();
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
    expect(mockBeamboxPreferenceWrite).toBeCalledTimes(6);
    expect(mockBeamboxPreferenceWrite).toHaveBeenNthCalledWith(1, 'engrave_dpi', 'high');
    expect(mockBeamboxPreferenceWrite).toHaveBeenNthCalledWith(2, 'borderless', true);
    expect(mockBeamboxPreferenceWrite).toHaveBeenNthCalledWith(3, 'enable-diode', true);
    expect(mockBeamboxPreferenceWrite).toHaveBeenNthCalledWith(4, 'enable-autofocus', true);
    expect(mockBeamboxPreferenceWrite).toHaveBeenNthCalledWith(5, 'workarea', 'fbm1');
    expect(mockBeamboxPreferenceWrite).toHaveBeenNthCalledWith(6, 'rotary_mode', 1);
    expect(setRotaryMode).toHaveBeenCalledTimes(1);
    expect(setRotaryMode).toHaveBeenLastCalledWith(1);
    expect(runExtensions).toHaveBeenCalledTimes(1);
    expect(runExtensions).toHaveBeenLastCalledWith('updateRotaryAxis');
    expect(setResolution).toHaveBeenLastCalledWith(3000, 2100);
    expect(mockToggleFullColorAfterWorkareaChange).toBeCalledTimes(1);
    expect(resetView).toBeCalledTimes(1);
    expect(update).toBeCalledTimes(1);
    expect(emitUpdateWorkArea).toBeCalledTimes(1);
    expect(mockUnmount).toBeCalledTimes(1);
  });
});
