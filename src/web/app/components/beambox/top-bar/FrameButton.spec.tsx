import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';

import { CanvasContext, CanvasMode } from 'app/contexts/CanvasContext';

import FrameButton from './FrameButton';

const mockGetVisibleElementsAndBBoxes = jest
  .fn()
  .mockReturnValue([{ bbox: { x: 0, y: 1, width: 2, height: 3 } }]);
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync: (callback) =>
    callback({
      Canvas: {
        getVisibleElementsAndBBoxes: (...args) => mockGetVisibleElementsAndBBoxes(...args),
      },
    }),
}));

const beamboxPreferenceRead = jest.fn();
jest.mock('app/actions/beambox/beambox-preference', () => ({
  read: (...args) => beamboxPreferenceRead(...args),
}));

const mockOpenMessage = jest.fn();
jest.mock('app/actions/message-caller', () => ({
  __esModule: true,
  default: { openMessage: (...args) => mockOpenMessage(...args) },
  MessageLevel: { INFO: 'info' },
}));

const mockOpenNonstopProgress = jest.fn();
const mockUpdate = jest.fn();
const mockPopById = jest.fn();

jest.mock('app/actions/progress-caller', () => ({
  openNonstopProgress: (...args) => mockOpenNonstopProgress(...args),
  update: (...args) => mockUpdate(...args),
  popById: (...args) => mockPopById(...args),
}));

jest.mock('helpers/useI18n', () => () => ({
  message: {
    connectingMachine: 'Connecting %s...',
    enteringRawMode: 'Entering raw mode...',
    exitingRotaryMode: 'Exiting rotary mode...',
    homing: 'Homing...',
    turningOffFan: 'Turning off fan...',
    turningOffAirPump: 'Turning off air pump...',
  },
  topbar: {
    frame_task: 'frame_task',
    alerts: {
      add_content_first: 'Please add objects first',
      headtype_mismatch: 'Incorrect module detected. ',
      headtype_none: 'Module not detected. ',
      headtype_unknown: 'Unknown module detected. ',
      install_correct_headtype:
        'Please install 10W/20W diode laser modules properly to enable low laser for running frame.',
      door_opened: 'Please close the door cover to enable low laser for running frame.',
      fail_to_get_door_status:
        'Please make sure the door cover is closed to enable low laser for running frame.',
    },
  },
  device: {
    processing: 'Processing',
  },
}));

jest.mock('app/contexts/CanvasContext', () => ({
  CanvasContext: React.createContext({ mode: 1 }),
  CanvasMode: {
    Draw: 1,
    Preview: 2,
    PathPreview: 3,
  },
}));

const versionChecker = jest.fn().mockReturnValue({ meetRequirement: () => true });
jest.mock(
  'helpers/version-checker',
  () =>
    (...args) =>
      versionChecker(...args)
);

const mockCheckDeviceStatus = jest.fn().mockResolvedValue({});
jest.mock(
  'helpers/check-device-status',
  () =>
    (...args) =>
      mockCheckDeviceStatus(...args)
);

const mockGetDeviceDetailInfo = jest.fn();
const mockGetDoorOpen = jest.fn();
const mockEnterRawMode = jest.fn();
const mockRawSetRotary = jest.fn();
const mockRawHome = jest.fn();
const mockRawStartLineCheckMode = jest.fn();
const mockRawSetFan = jest.fn();
const mockRawSetAirPump = jest.fn();
const mockRawSetWaterPump = jest.fn();
const mockRawMove = jest.fn();
const mockRawEndLineCheckMode = jest.fn();
const mockRawLooseMotor = jest.fn();
const mockRawSetLaser = jest.fn();
const mockRawSet24V = jest.fn();
const mockEndRawMode = jest.fn();
const mockKick = jest.fn();

jest.mock('helpers/device-master', () => ({
  getDeviceDetailInfo: () => mockGetDeviceDetailInfo(),
  getDoorOpen: () => mockGetDoorOpen(),
  enterRawMode: (...args) => mockEnterRawMode(...args),
  rawSetRotary: (...args) => mockRawSetRotary(...args),
  rawHome: (...args) => mockRawHome(...args),
  rawStartLineCheckMode: (...args) => mockRawStartLineCheckMode(...args),
  rawSetFan: (...args) => mockRawSetFan(...args),
  rawSetAirPump: (...args) => mockRawSetAirPump(...args),
  rawSetWaterPump: (...args) => mockRawSetWaterPump(...args),
  rawMove: (...args) => mockRawMove(...args),
  rawEndLineCheckMode: (...args) => mockRawEndLineCheckMode(...args),
  rawLooseMotor: (...args) => mockRawLooseMotor(...args),
  rawSetLaser: (...args) => mockRawSetLaser(...args),
  rawSet24V: (...args) => mockRawSet24V(...args),
  endRawMode: (...args) => mockEndRawMode(...args),
  kick: (...args) => mockKick(...args),
  currentControlMode: 'raw',
}));

const mockGetDevice = jest.fn().mockResolvedValue({ device: {} });
jest.mock(
  'helpers/device/get-device',
  () =>
    (...args) =>
      mockGetDevice(...args)
);

const mockGetWidth = jest.fn();
const mockGetHeight = jest.fn();
const mockGetRotaryExpansion = jest.fn();
jest.mock('app/svgedit/workarea', () => ({
  get width() {
    return mockGetWidth();
  },
  get height() {
    return mockGetHeight();
  },
  get rotaryExpansion() {
    return mockGetRotaryExpansion();
  },
}));

const mockRead = jest.fn();
jest.mock('app/actions/beambox/beambox-preference', () => ({
  read: (...args) => mockRead(...args),
}));

describe('test FrameButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render correctly', async () => {
    const { container } = render(<FrameButton />);
    expect(container).toMatchSnapshot();
    mockGetWidth.mockReturnValue(3000);
    mockGetHeight.mockReturnValue(2100);
    mockGetRotaryExpansion.mockReturnValue([0, 0]);
    mockGetDevice.mockResolvedValueOnce({ device: { model: 'fbm1', version: '4.1.7' } });
    fireEvent.click(container.querySelector('div[class*="button"]'));
    await waitFor(() => expect(mockPopById).toBeCalledTimes(1));
    expect(mockGetDevice).toBeCalledTimes(1);
    expect(mockCheckDeviceStatus).toBeCalledTimes(1);
    expect(mockOpenNonstopProgress).toBeCalledTimes(1);
    expect(mockUpdate).toBeCalledTimes(6);
    expect(mockEnterRawMode).toBeCalledTimes(1);
    expect(mockRawSetRotary).toBeCalledTimes(1);
    expect(mockRawHome).toBeCalledTimes(1);
    expect(mockRawStartLineCheckMode).toBeCalledTimes(1);
    expect(mockRawSetFan).toBeCalledTimes(1);
    expect(mockRawSetAirPump).toBeCalledTimes(1);
    expect(mockRawSetWaterPump).toBeCalledTimes(1);
    expect(mockRawMove).toBeCalledTimes(5);
    expect(mockRawEndLineCheckMode).toBeCalledTimes(1);
    expect(mockRawSetLaser).toBeCalledTimes(1);
    expect(mockRawSetLaser).toBeCalledWith({ on: false, s: 0 });
    expect(mockRawSet24V).toBeCalledTimes(1);
    expect(mockRawSet24V).toBeCalledWith(false);
    expect(mockRawLooseMotor).toBeCalledTimes(1);
    expect(mockEndRawMode).toBeCalledTimes(1);
    expect(mockKick).toBeCalledTimes(1);
    expect(mockGetDeviceDetailInfo).not.toBeCalled();
    expect(mockRead).not.toBeCalled();
  });

  test('should render correctly with previewing mode', () => {
    const { container } = render(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <CanvasContext.Provider value={{ mode: CanvasMode.Preview } as any}>
        <FrameButton />
      </CanvasContext.Provider>
    );
    expect(container).toMatchSnapshot();
  });

  test('no element', () => {
    mockGetVisibleElementsAndBBoxes.mockReturnValueOnce([]);
    const { container } = render(<FrameButton />);
    fireEvent.click(container.querySelector('div[class*="button"]'));
    expect(mockOpenMessage).toBeCalledTimes(1);
    expect(mockOpenMessage).toBeCalledWith({
      key: 'no-element-to-frame',
      level: 'info',
      content: 'Please add objects first',
      duration: 3,
    });
  });

  test('low laser', async () => {
    const { container } = render(<FrameButton />);
    mockGetWidth.mockReturnValue(4300);
    mockGetHeight.mockReturnValue(3000);
    mockGetRotaryExpansion.mockReturnValue([0, 0]);
    mockGetDevice.mockResolvedValue({ device: { model: 'ado1', version: '4.1.7' } });
    mockGetDeviceDetailInfo.mockResolvedValue({ head_type: 1 });
    mockRead.mockReturnValue(3);
    mockGetDoorOpen.mockResolvedValue({ value: '1', cmd: 'play get_door_open', status: 'ok' });
    fireEvent.click(container.querySelector('div[class*="button"]'));
    await waitFor(() => expect(mockPopById).toBeCalledTimes(1));
    expect(mockGetDevice).toBeCalledTimes(1);
    expect(mockCheckDeviceStatus).toBeCalledTimes(1);
    expect(mockOpenNonstopProgress).toBeCalledTimes(1);
    expect(mockGetDeviceDetailInfo).toBeCalledTimes(1);
    expect(mockRead).toBeCalledTimes(1);
    expect(mockGetDoorOpen).toBeCalledTimes(1);
    expect(mockOpenMessage).toBeCalledTimes(1);
    expect(mockOpenMessage).toBeCalledWith({
      key: 'low-laser-warning',
      level: 'info',
      content: 'Please close the door cover to enable low laser for running frame.',
    });
    expect(mockUpdate).toBeCalledTimes(6);
    expect(mockEnterRawMode).toBeCalledTimes(1);
    expect(mockRawSetRotary).toBeCalledTimes(1);
    expect(mockRawHome).toBeCalledTimes(1);
    expect(mockRawStartLineCheckMode).toBeCalledTimes(1);
    expect(mockRawSetFan).toBeCalledTimes(1);
    expect(mockRawSetAirPump).toBeCalledTimes(1);
    expect(mockRawMove).toBeCalledTimes(5);
    expect(mockRawEndLineCheckMode).toBeCalledTimes(1);
    expect(mockRawSetLaser).toBeCalledTimes(2);
    expect(mockRawSetLaser).toHaveBeenNthCalledWith(1, { on: true, s: 30 });
    expect(mockRawSetLaser).toHaveBeenNthCalledWith(2, { on: false, s: 0 });
    expect(mockRawSet24V).toBeCalledTimes(2);
    expect(mockRawSet24V).toHaveBeenNthCalledWith(1, true);
    expect(mockRawSet24V).toHaveBeenNthCalledWith(2, false);
    expect(mockRawLooseMotor).toBeCalledTimes(1);
    expect(mockEndRawMode).toBeCalledTimes(1);
    expect(mockKick).toBeCalledTimes(1);
    expect(mockRawSetWaterPump).not.toBeCalled();
  });
});
