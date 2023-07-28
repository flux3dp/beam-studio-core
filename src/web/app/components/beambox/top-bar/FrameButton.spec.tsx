import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';

import { CanvasContext } from 'app/contexts/CanvasContext';

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
  MessageLevel: {},
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
    }
  },
  device: {
    processing: 'Processing',
  },
}));

jest.mock('app/contexts/CanvasContext', () => ({
  CanvasContext: React.createContext({ isPreviewing: false }),
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
const mockEndRawMode = jest.fn();
const mockKick = jest.fn();

jest.mock('helpers/device-master', () => ({
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
  endRawMode: (...args) => mockEndRawMode(...args),
  kick: (...args) => mockKick(...args),
}));

const mockGetDevice = jest.fn().mockResolvedValue({ device: {} });
jest.mock(
  'helpers/device/get-device',
  () =>
    (...args) =>
      mockGetDevice(...args)
);

describe('test FrameButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('should render correctly', async () => {
    const { container } = render(<FrameButton />);
    expect(container).toMatchSnapshot();
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
    expect(mockRawLooseMotor).toBeCalledTimes(1);
    expect(mockEndRawMode).toBeCalledTimes(1);
    expect(mockKick).toBeCalledTimes(1);
  });

  test('should render correctly with previewing mode', () => {
    const { container } = render(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      <CanvasContext.Provider value={{ isPreviewing: true } as any}>
        <FrameButton />
      </CanvasContext.Provider>
    );
    expect(container).toMatchSnapshot();
  });

  test('no element', () => {
    mockGetVisibleElementsAndBBoxes.mockReturnValue([]);
    const { container } = render(<FrameButton />);
    fireEvent.click(container.querySelector('div[class*="button"]'));
    expect(mockOpenMessage).toBeCalledTimes(1);
  });
});
