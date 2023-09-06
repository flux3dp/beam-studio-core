import React from 'react';
import { render } from '@testing-library/react';

import { CanvasContext } from 'app/contexts/CanvasContext';

import GoButton from './GoButton';

const popUp = jest.fn();
jest.mock('app/actions/alert-caller', () => ({
  popUp: (...args) => popUp(...args),
}));

const alertConfigRead = jest.fn();
const write = jest.fn();
jest.mock('helpers/api/alert-config', () => ({
  read: (...args) => alertConfigRead(...args),
  write: (...args) => write(...args),
}));

const beamboxPreferenceRead = jest.fn();
jest.mock('app/actions/beambox/beambox-preference', () => ({
  read: (...args) => beamboxPreferenceRead(...args),
}));

const showConfirmPromptDialog = jest.fn();
jest.mock('app/actions/dialog-caller', () => ({
  showConfirmPromptDialog: (...args) => showConfirmPromptDialog(...args),
}));

const uploadFcode = jest.fn();
jest.mock('app/actions/beambox/export-funcs', () => ({
  uploadFcode: (...args) => uploadFcode(...args),
}));

const get = jest.fn();
jest.mock('implementations/storage', () => ({
  get: (...args) => get(...args),
}));

const switchImageSymbolForAll = jest.fn();
jest.mock('helpers/symbol-maker', () => ({
  switchImageSymbolForAll: (...args) => switchImageSymbolForAll(...args),
}));

jest.mock('app/constants/tutorial-constants', () => ({
  SEND_FILE: 'SEND_FILE',
}));

const versionChecker = jest.fn();
jest.mock('helpers/version-checker', () => (...args) => versionChecker(...args));

const getNextStepRequirement = jest.fn();
const handleNextStep = jest.fn();
jest.mock('app/views/tutorials/tutorialController', () => ({
  getNextStepRequirement: (...args) => getNextStepRequirement(...args),
  handleNextStep: (...args) => handleNextStep(...args),
}));

const mockExecuteFirmwareUpdate = jest.fn();
jest.mock('app/actions/beambox/menuDeviceActions', () => ({
  executeFirmwareUpdate: (...args) => mockExecuteFirmwareUpdate(...args),
}));

jest.mock('helpers/useI18n', () => () => ({
  topbar: {
    alerts: {
      power_too_high: 'POWER TOO HIGH',
      power_too_high_msg: 'power_too_high_msg',
      power_too_high_confirm: 'NOTED',
    },
    export: 'GO',
  },
  update: {
    update: 'update',
    firmware: {
      force_update_message: 'force_update_message',
    },
  },
  beambox: {
    popup: {
      too_fast_for_path: 'too_fast_for_path.',
      too_fast_for_path_and_constrain: 'too_fast_for_path_and_constrain',
      should_update_firmware_to_continue: 'should_update_firmware_to_continue',
      dont_show_again: 'Don\'t Show this next time.',
    },
  },
  message: {
    unavailableWorkarea: 'unavailableWorkarea',
  },
}));

const getCurrentDrawing = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync: (callback) => callback({
    Canvas: {
      getCurrentDrawing: (...args) => getCurrentDrawing(...args),
    },
  }),
}));

jest.mock('app/contexts/CanvasContext', () => ({
  CanvasContext: React.createContext(null),
}));

describe('test GoButton', () => {
  test('should render correctly', () => {
    const endPreviewMode = jest.fn();
    const { container } = render(
      <CanvasContext.Provider value={{
        endPreviewMode,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any}
      >
        <GoButton
          hasText={false}
          hasDiscoverdMachine={false}
          hasDevice
          showDeviceList={jest.fn()}
        />
      </CanvasContext.Provider>
    );

    expect(container).toMatchSnapshot();
  });
});
