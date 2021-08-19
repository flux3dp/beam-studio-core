/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const beamboxPreferences = {
  engrave_dpi: 'medium',
  workarea: 'fbb1b',
  rotary_mode: false,
  borderless: false,
  'enable-diode': false,
  'enable-autofocus': false,
};
jest.mock('app/actions/beambox/beambox-preference', () => ({
  read: (key) => beamboxPreferences[key],
  write: (key, value) => { beamboxPreferences[key] = value; },
}));

const emitUpdateLaserPanel = jest.fn();
jest.mock('app/stores/beambox-store', () => ({
  emitUpdateLaserPanel,
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
  update,
}));

const updateCanvasSize = jest.fn();
jest.mock('app/actions/beambox/preview-mode-background-drawer', () => ({
  updateCanvasSize,
}));

const getSVGAsync = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync,
}));

const setRotaryMode = jest.fn();
const runExtensions = jest.fn();
const setResolution = jest.fn();
const resetView = jest.fn();
getSVGAsync.mockImplementation((callback) => {
  callback({
    Canvas: {
      setRotaryMode,
      runExtensions,
      setResolution,
    },
    Editor: {
      resetView,
    },
  });
});

import DocumentSettings from './DocumentSettings';

test('should render correctly', () => {
  const unmount = jest.fn();
  const wrapper = shallow(<DocumentSettings
    unmount={unmount}
  />);
  const setState = jest.spyOn(wrapper.instance(), 'setState');
  expect(toJson(wrapper)).toMatchSnapshot();

  wrapper.find('EngraveDpiSlider').simulate('change', 'high');
  expect(setState).toHaveBeenCalledTimes(1);
  expect(toJson(wrapper)).toMatchSnapshot();

  wrapper.find('DropDownControl').simulate('change', 'fbb1p');
  expect(setState).toHaveBeenCalledTimes(2);
  expect(toJson(wrapper)).toMatchSnapshot();

  wrapper.find('SwitchControl').at(0).simulate('change', true);
  expect(setState).toHaveBeenCalledTimes(3);
  expect(setRotaryMode).toHaveBeenCalledTimes(1);
  expect(setRotaryMode).toHaveBeenNthCalledWith(1, true);
  expect(runExtensions).toHaveBeenCalledTimes(1);
  expect(runExtensions).toHaveBeenNthCalledWith(1, 'updateRotaryAxis');
  expect(toJson(wrapper)).toMatchSnapshot();
});
