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
jest.mock(
  'helpers/version-checker',
  () =>
    (...args) =>
      versionChecker(...args)
);

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

const getCurrentDrawing = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync: (callback) =>
    callback({
      Canvas: {
        getCurrentDrawing: (...args) => getCurrentDrawing(...args),
      },
    }),
}));

jest.mock('app/contexts/CanvasContext', () => ({
  CanvasContext: React.createContext(null),
}));

const mockCheckOldFirmware = jest.fn();
jest.mock(
  'helpers/device/checkOldFirmware',
  () =>
    (...args) =>
      mockCheckOldFirmware(...args)
);

const mockCheckDeviceStatus = jest.fn();
jest.mock(
  'helpers/check-device-status',
  () =>
    (...args) =>
      mockCheckDeviceStatus(...args)
);

const mockGetDevice = jest.fn();
jest.mock(
  'helpers/device/get-device',
  () =>
    (...args) =>
      mockGetDevice(...args)
);

const mockShowAdorCalibration = jest.fn();
jest.mock('app/components/dialogs/camera/AdorCalibration', () => ({
  showAdorCalibration: (...args) => mockShowAdorCalibration(...args),
}));

describe('test GoButton', () => {
  test('should render correctly', () => {
    const endPreviewMode = jest.fn();
    const { container } = render(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <CanvasContext.Provider value={{ endPreviewMode } as any}>
        <GoButton hasDiscoverdMachine={false} />
      </CanvasContext.Provider>
    );

    expect(container).toMatchSnapshot();
  });
});
