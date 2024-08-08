import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';

import { CanvasContext, CanvasMode } from 'app/contexts/CanvasContext';

import FrameButton from './FrameButton';

const mockGetVisibleElementsAndBBoxes = jest.fn();
jest.mock('helpers/svg-editor-helper', () => ({
  getSVGAsync: (callback) =>
    callback({
      Canvas: {
        getVisibleElementsAndBBoxes: (...args) => mockGetVisibleElementsAndBBoxes(...args),
      },
    }),
}));

const mockRead = jest.fn();
jest.mock('app/actions/beambox/beambox-preference', () => ({
  read: (...args) => mockRead(...args),
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
const mockRawHomeZ = jest.fn();
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
const mockRawMoveZRelToLastHome = jest.fn();

jest.mock('helpers/device-master', () => ({
  getDeviceDetailInfo: () => mockGetDeviceDetailInfo(),
  getDoorOpen: () => mockGetDoorOpen(),
  enterRawMode: (...args) => mockEnterRawMode(...args),
  rawSetRotary: (...args) => mockRawSetRotary(...args),
  rawHome: (...args) => mockRawHome(...args),
  rawHomeZ: (...args) => mockRawHomeZ(...args),
  rawMoveZRelToLastHome: (...args) => mockRawMoveZRelToLastHome(...args),
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
const mockGetExpansion = jest.fn();
jest.mock('app/svgedit/workarea', () => ({
  get width() {
    return mockGetWidth();
  },
  get height() {
    return mockGetHeight();
  },
  get expansion() {
    return mockGetExpansion();
  },
}));

const mockGetData = jest.fn();
jest.mock('helpers/layer/layer-config-helper', () => ({
  getData: (...args) => mockGetData(...args),
  DataType: {
    module: 'module',
  },
}));

const mockGetAllLayers = jest.fn();
jest.mock('helpers/layer/layer-helper', () => ({
  getAllLayers: (...args) => mockGetAllLayers(...args),
}));

const mockGetPosition = jest.fn();
jest.mock('app/actions/canvas/rotary-axis', () => ({
  getPosition: (...args) => mockGetPosition(...args),
}));

describe('test FrameButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllLayers.mockReturnValueOnce(['layer1', 'layer2']);
    mockGetVisibleElementsAndBBoxes.mockReturnValue([
      { bbox: { x: 0, y: 10, width: 20, height: 30 } },
    ]);
  });

  test('should render correctly', async () => {
    const { container } = render(<FrameButton />);
    expect(container).toMatchSnapshot();
    mockGetWidth.mockReturnValue(3000);
    mockGetHeight.mockReturnValue(2100);
    mockGetExpansion.mockReturnValue([0, 0]);
    mockGetDevice.mockResolvedValueOnce({ device: { model: 'fbm1', version: '4.1.7' } });
    mockRead.mockReturnValue(null);
    fireEvent.click(container.querySelector('div[class*="button"]'));
    await waitFor(() => expect(mockPopById).toBeCalledTimes(1));
    expect(mockGetAllLayers).toBeCalledTimes(1);
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
    expect(mockRawLooseMotor).toBeCalledTimes(1);
    expect(mockEndRawMode).toBeCalledTimes(1);
    expect(mockKick).toBeCalledTimes(1);
    expect(mockGetDeviceDetailInfo).not.toBeCalled();
    expect(mockRead).toBeCalledTimes(2);
    expect(mockRead).toHaveBeenNthCalledWith(1, 'module-offsets');
    expect(mockRead).toHaveBeenNthCalledWith(2, 'rotary_mode');
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

  test('no element', async () => {
    mockGetDevice.mockResolvedValue({ device: { model: 'ado1', version: '4.1.7' } });
    mockGetWidth.mockReturnValue(4300);
    mockGetHeight.mockReturnValue(3000);
    mockGetExpansion.mockReturnValue([0, 0]);
    mockGetVisibleElementsAndBBoxes.mockReturnValue([]);
    const { container } = render(<FrameButton />);
    fireEvent.click(container.querySelector('div[class*="button"]'));
    await waitFor(() => expect(mockOpenMessage).toBeCalledTimes(1));
    expect(mockOpenMessage).toBeCalledWith({
      key: 'no-element-to-frame',
      level: 'info',
      content: 'Please add objects first',
      duration: 3,
    });
  });

  test('ador low laser', async () => {
    const { container } = render(<FrameButton />);
    mockGetWidth.mockReturnValue(4300);
    mockGetHeight.mockReturnValue(3000);
    mockGetExpansion.mockReturnValue([0, 0]);
    mockGetDevice.mockResolvedValue({ device: { model: 'ado1', version: '4.1.7' } });
    mockGetDeviceDetailInfo.mockResolvedValue({ head_type: 1 });
    mockRead.mockReturnValueOnce(null).mockReturnValueOnce(3).mockReturnValueOnce(0);
    mockGetDoorOpen.mockResolvedValue({ value: '1', cmd: 'play get_door_open', status: 'ok' });
    fireEvent.click(container.querySelector('div[class*="button"]'));
    await waitFor(() => expect(mockPopById).toBeCalledTimes(1));
    expect(mockGetAllLayers).toBeCalledTimes(1);
    expect(mockGetDevice).toBeCalledTimes(1);
    expect(mockCheckDeviceStatus).toBeCalledTimes(1);
    expect(mockOpenNonstopProgress).toBeCalledTimes(1);
    expect(mockGetDeviceDetailInfo).toBeCalledTimes(1);
    expect(mockRead).toBeCalledTimes(3);
    expect(mockRead).toHaveBeenNthCalledWith(1, 'module-offsets');
    expect(mockRead).toHaveBeenNthCalledWith(2, 'low_power');
    expect(mockRead).toHaveBeenNthCalledWith(3, 'rotary_mode');
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
    expect(mockRawHomeZ).not.toBeCalled();
    expect(mockRawHome).toBeCalledTimes(1);
    expect(mockRawStartLineCheckMode).toBeCalledTimes(1);
    expect(mockRawSetFan).toBeCalledTimes(1);
    expect(mockRawSetAirPump).toBeCalledTimes(1);
    expect(mockRawMoveZRelToLastHome).not.toBeCalled();
    expect(mockRawMove).toBeCalledTimes(5);
    expect(mockRawMove).toHaveBeenNthCalledWith(1, { x: 0, y: 1, f: 6000 });
    expect(mockRawMove).toHaveBeenNthCalledWith(2, { x: 2, y: 1, f: 6000 });
    expect(mockRawMove).toHaveBeenNthCalledWith(3, { x: 2, y: 4, f: 6000 });
    expect(mockRawMove).toHaveBeenNthCalledWith(4, { x: 0, y: 4, f: 6000 });
    expect(mockRawMove).toHaveBeenNthCalledWith(5, { x: 0, y: 1, f: 6000 });
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

  test('ador low laser with rotary and mirror', async () => {
    const { container } = render(<FrameButton />);
    mockGetWidth.mockReturnValue(4300);
    mockGetHeight.mockReturnValue(3000);
    mockGetExpansion.mockReturnValue([0, 0]);
    mockGetDevice.mockResolvedValue({ device: { model: 'ado1', version: '4.1.7' } });
    mockGetDeviceDetailInfo.mockResolvedValue({ head_type: 1 });
    mockRead.mockReturnValueOnce(null).mockReturnValueOnce(3).mockReturnValueOnce(1);
    mockGetDoorOpen.mockResolvedValue({ value: '1', cmd: 'play get_door_open', status: 'ok' });
    mockGetPosition.mockReturnValue(10);
    fireEvent.click(container.querySelector('div[class*="button"]'));
    await waitFor(() => expect(mockPopById).toBeCalledTimes(1));
    expect(mockGetAllLayers).toBeCalledTimes(1);
    expect(mockGetDevice).toBeCalledTimes(1);
    expect(mockCheckDeviceStatus).toBeCalledTimes(1);
    expect(mockOpenNonstopProgress).toBeCalledTimes(1);
    expect(mockGetDeviceDetailInfo).toBeCalledTimes(1);
    expect(mockRead).toBeCalledTimes(4);
    expect(mockRead).toHaveBeenNthCalledWith(1, 'module-offsets');
    expect(mockRead).toHaveBeenNthCalledWith(2, 'low_power');
    expect(mockRead).toHaveBeenNthCalledWith(3, 'rotary_mode');
    expect(mockRead).toHaveBeenNthCalledWith(4, 'rotary-mirror');
    expect(mockGetDoorOpen).toBeCalledTimes(1);
    expect(mockOpenMessage).toBeCalledTimes(1);
    expect(mockOpenMessage).toBeCalledWith({
      key: 'low-laser-warning',
      level: 'info',
      content: 'Please close the door cover to enable low laser for running frame.',
    });
    expect(mockUpdate).toBeCalledTimes(6);
    expect(mockEnterRawMode).toBeCalledTimes(1);
    expect(mockRawHomeZ).toBeCalledTimes(1);
    expect(mockRawSetRotary).toBeCalledTimes(3);
    expect(mockRawSetRotary).toHaveBeenNthCalledWith(1, false);
    expect(mockRawSetRotary).toHaveBeenNthCalledWith(2, true);
    expect(mockRawSetRotary).toHaveBeenNthCalledWith(3, false);
    expect(mockRawHome).toBeCalledTimes(1);
    expect(mockRawStartLineCheckMode).toBeCalledTimes(1);
    expect(mockRawSetFan).toBeCalledTimes(1);
    expect(mockRawSetAirPump).toBeCalledTimes(1);
    expect(mockRawMoveZRelToLastHome).toBeCalledTimes(1);
    expect(mockRawMoveZRelToLastHome).toHaveBeenNthCalledWith(1, 0);
    expect(mockRawMove).toBeCalledTimes(8);
    expect(mockRawMove).toHaveBeenNthCalledWith(1, { x: 0, f: 6000 });
    expect(mockRawMove).toHaveBeenNthCalledWith(2, { y: 10, f: 6000 });
    expect(mockRawMove).toHaveBeenNthCalledWith(3, { x: 0, a: 19, f: 6000 });
    expect(mockRawMove).toHaveBeenNthCalledWith(4, { x: 2, a: 19, f: 6000 });
    expect(mockRawMove).toHaveBeenNthCalledWith(5, { x: 2, a: 16, f: 6000 });
    expect(mockRawMove).toHaveBeenNthCalledWith(6, { x: 0, a: 16, f: 6000 });
    expect(mockRawMove).toHaveBeenNthCalledWith(7, { x: 0, a: 19, f: 6000 });
    expect(mockRawMove).toHaveBeenNthCalledWith(8, { a: 10, f: 6000 });
    expect(mockRawEndLineCheckMode).toBeCalledTimes(1);
    expect(mockRawSetLaser).toBeCalledTimes(3);
    expect(mockRawSetLaser).toHaveBeenNthCalledWith(1, { on: true, s: 30 });
    expect(mockRawSetLaser).toHaveBeenNthCalledWith(2, { on: false, s: 0 });
    expect(mockRawSetLaser).toHaveBeenNthCalledWith(3, { on: false, s: 0 });
    expect(mockRawSet24V).toBeCalledTimes(2);
    expect(mockRawSet24V).toHaveBeenNthCalledWith(1, true);
    expect(mockRawSet24V).toHaveBeenNthCalledWith(2, false);
    expect(mockRawLooseMotor).toBeCalledTimes(1);
    expect(mockEndRawMode).toBeCalledTimes(1);
    expect(mockKick).toBeCalledTimes(1);
    expect(mockRawSetWaterPump).not.toBeCalled();
  });
});
