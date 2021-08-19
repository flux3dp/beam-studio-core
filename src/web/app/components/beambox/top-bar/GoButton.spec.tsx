/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const popUp = jest.fn();
jest.mock('app/actions/alert-caller', () => ({
  popUp,
}));

const alertConfigRead = jest.fn();
const write = jest.fn();
jest.mock('helpers/api/alert-config', () => ({
  read: alertConfigRead,
  write,
}));

const beamboxPreferenceRead = jest.fn();
jest.mock('app/actions/beambox/beambox-preference', () => ({
  read: beamboxPreferenceRead,
}));

const showConfirmPromptDialog = jest.fn();
jest.mock('app/actions/dialog-caller', () => ({
  showConfirmPromptDialog,
}));

const exportFcode = jest.fn();
const uploadFcode = jest.fn();
jest.mock('app/actions/beambox/export-funcs', () => ({
  exportFcode,
  uploadFcode,
}));

const get = jest.fn();
jest.mock('implementations/storage', () => ({
  get,
}));

const switchImageSymbolForAll = jest.fn();
jest.mock('helpers/symbol-maker', () => ({
  switchImageSymbolForAll,
}));

jest.mock('app/constants/tutorial-constants', () => ({
  SEND_FILE: 'SEND_FILE',
}));

const versionChecker = jest.fn();
jest.mock('helpers/version-checker', () => versionChecker);

const getNextStepRequirement = jest.fn();
const handleNextStep = jest.fn();
jest.mock('app/views/tutorials/tutorialController', () => ({
  getNextStepRequirement,
  handleNextStep,
}));

jest.mock('helpers/i18n', () => ({
  lang: {
    topbar: {
      alerts: {
        power_too_high: 'POWER TOO HIGH',
        power_too_high_msg: 'Using lower laser power (under 70%) will extends laser tube\'s lifetime.\nEnter "NOTED" to proceed.',
        power_too_high_confirm: 'NOTED',
      },
      export: 'GO',
    },
    beambox: {
      popup: {
        too_fast_for_path: 'Using too high speed in layers containing path objects may result in lower precision when cutting.\nWe don\'t recommend using speed faster than 20 mm/s when cutting.',
        too_fast_for_path_and_constrain: 'Following layers: %s\ncontain vector path objects, and have speed exceeding 20 mm/s.\nThe cutting speed of vector path objects will be constrained to 20 mm/s.\nYou can remove this limit at Preferences Settings.',
        should_update_firmware_to_continue: '#814 Your firmware does not support this version of Beam Studio. Kindly update firmware to continue. (Menu > Machine > [Your Machine] > Update Firmware)',
        dont_show_again: 'Don\'t Show this next time.',
      },
    },
    message: {
      unavailableWorkarea: '#804 Current workarea exceeds the workarea of this machine. Please check the workarea of selected machine or set workarea from Edit > Document Setting.',
    },
  },
}));

const getSVGAsync = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync,
}));

const getCurrentDrawing = jest.fn();
getSVGAsync.mockImplementation((callback) => {
  callback({
    Canvas: {
      getCurrentDrawing,
    },
  });
});

import GoButton from './GoButton';

test('should render correctly', () => {
  expect(toJson(shallow(<GoButton
    isNotMac={false}
    hasDiscoverdMachine={false}
    hasDevice
    endPreviewMode={jest.fn()}
    showDeviceList={jest.fn()}
  />))).toMatchSnapshot();

  const endPreviewMode = jest.fn();
  const showDeviceList = jest.fn();
  const wrapper = shallow(<GoButton
    isNotMac
    hasDiscoverdMachine
    hasDevice
    endPreviewMode={endPreviewMode}
    showDeviceList={showDeviceList}
  />);

  expect(toJson(wrapper)).toMatchSnapshot();
});
