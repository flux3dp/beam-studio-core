import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import DocumentSettings from './DocumentSettings';

jest.mock('antd', () => ({
  Col: ({ children, ...props }: any) => (
    <div>
      Dummy Col
      <p>props: {JSON.stringify(props)}</p>
      {children}
    </div>
  ),
  Row: ({ children }: any) => <div className="row">{children}</div>,
  get Form() {
    const mockFormItem = ({ children, name }: any) => (
      <div>
        Dummy FormItem
        <p>name: {name}</p>
        {children}
      </div>
    );
    const mockForm = ({ children }: any) => (
      <div>
        Dummy Form
        {children}
      </div>
    );
    mockForm.Item = mockFormItem;
    return mockForm;
  },
  Modal: ({ children, title, onOk, okText, onCancel, cancelText }: any) => (
    <div>
      Dummy Modal
      <p>title: {title}</p>
      {children}
      <button type="button" onClick={onOk}>
        {okText}
      </button>
      <button type="button" onClick={onCancel}>
        {cancelText}
      </button>
    </div>
  ),
  get Select() {
    const mockSelectOption = ({ value, children }: any) => (
      <div>
        Dummy SelectOption
        <p>value: {value}</p>
        {children}
      </div>
    );
    const mockSelect = ({ onChange, children }: any) => (
      <div>
        Dummy Select
        <button type="button" onClick={() => onChange('fbm1')}>
          change workarea
        </button>
        {children}
      </div>
    );
    mockSelect.Option = mockSelectOption;
    return mockSelect;
  },
  Switch: ({ checked, disabled, onChange }: any) => (
    <div>
      Dummy Switch
      <p>checked: {String(checked)}</p>
      <p>disabled: {String(disabled)}</p>
      <button type="button" onClick={() => onChange(!checked)}>
        change
      </button>
    </div>
  ),
}));

const beamboxPreferences = {
  engrave_dpi: 'medium',
  workarea: 'fbb1b',
  rotary_mode: false,
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

jest.mock('helpers/i18n', () => ({
  lang: {
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
      },
    },
  },
}));

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

jest.mock('app/widgets/EngraveDpiSlider', () => ({ value, onChange }: any) => (
  <div>
    DummyEngraveDpiSlider
    <p>value: {value}</p>
    <button type="button" onClick={() => onChange('high')}>change dpi</button>
  </div>
));

const mockUnmount = jest.fn();

describe('test DocumentSettings', () => {
  test('should render correctly', () => {
    const { container, getAllByText, getByText } = render(<DocumentSettings unmount={mockUnmount} />);
    expect(container).toMatchSnapshot();

    fireEvent.click(getByText('change dpi'));
    expect(container).toMatchSnapshot();

    fireEvent.click(getByText('change workarea'));
    expect(container).toMatchSnapshot();

    fireEvent.click(getAllByText('change')[0]);
    expect(setRotaryMode).toHaveBeenCalledTimes(1);
    expect(setRotaryMode).toHaveBeenLastCalledWith(true);
    expect(runExtensions).toHaveBeenCalledTimes(1);
    expect(runExtensions).toHaveBeenLastCalledWith('updateRotaryAxis');
    expect(container).toMatchSnapshot();

    fireEvent.click(getAllByText('change')[1]);
    fireEvent.click(getAllByText('change')[2]);
    fireEvent.click(getAllByText('change')[3]);

    expect(mockBeamboxPreferenceWrite).not.toBeCalled();
    expect(setResolution).not.toBeCalled();
    expect(resetView).not.toBeCalled();
    expect(update).not.toBeCalled();
    expect(emitUpdateWorkArea).not.toBeCalled();
    expect(mockUnmount).not.toBeCalled();
    fireEvent.click(getByText('Save'));
    expect(mockBeamboxPreferenceWrite).toBeCalledTimes(6);
    expect(mockBeamboxPreferenceWrite).toHaveBeenNthCalledWith(1, 'engrave_dpi', 'high');
    expect(mockBeamboxPreferenceWrite).toHaveBeenNthCalledWith(2, 'rotary_mode', true);
    expect(mockBeamboxPreferenceWrite).toHaveBeenNthCalledWith(3, 'borderless', true);
    expect(mockBeamboxPreferenceWrite).toHaveBeenNthCalledWith(4, 'enable-diode', true);
    expect(mockBeamboxPreferenceWrite).toHaveBeenNthCalledWith(5, 'enable-autofocus', true);
    expect(mockBeamboxPreferenceWrite).toHaveBeenNthCalledWith(6, 'workarea', 'fbm1');
    expect(setResolution).toHaveBeenLastCalledWith(3000, 2100);
    expect(resetView).toBeCalledTimes(1);
    expect(update).toBeCalledTimes(1);
    expect(emitUpdateWorkArea).toBeCalledTimes(1);
    expect(mockUnmount).toBeCalledTimes(1);
  });
});
