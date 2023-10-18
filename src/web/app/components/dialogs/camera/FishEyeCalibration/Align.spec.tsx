import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';

import { FisheyeCameraParameters } from 'app/constants/camera-calibration-constants';

import Align from './Align';

const mockPopUpError = jest.fn();
jest.mock('app/actions/alert-caller', () => ({
  popUpError: (...args) => mockPopUpError(...args),
}));

jest.mock('app/constants/device-constants', () => ({
  WORKAREA_DEEP: {
    ado1: 40,
  },
}));

const mockEnterRawMode = jest.fn();
const mockRawGetProbePos = jest.fn();
const mockEndRawMode = jest.fn();
const mockSetFisheyeMatrix = jest.fn();
const mockTakeOnePicture = jest.fn();
const mockConnectCamera = jest.fn();
const mockDisconnectCamera = jest.fn();
jest.mock('helpers/device-master', () => ({
  enterRawMode: (...args) => mockEnterRawMode(...args),
  rawGetProbePos: (...args) => mockRawGetProbePos(...args),
  endRawMode: (...args) => mockEndRawMode(...args),
  setFisheyeMatrix: (...args) => mockSetFisheyeMatrix(...args),
  takeOnePicture: (...args) => mockTakeOnePicture(...args),
  connectCamera: (...args) => mockConnectCamera(...args),
  disconnectCamera: (...args) => mockDisconnectCamera(...args),
  currentDevice: {
    info: {
      model: 'ado1',
    },
  },
}));

jest.mock('helpers/useI18n', () => () => ({
  buttons: {
    back: 'back',
    next: 'next',
  },
  calibration: {
    taking_picture: 'taking_picture',
  },
}));

const mockInterpolatePointsFromHeight = jest.fn();
jest.mock('helpers/camera-calibration-helper', () => ({
  interpolatePointsFromHeight: (...args) => mockInterpolatePointsFromHeight(...args),
}));

const mockOpenNonstopProgress = jest.fn();
const mockPopById = jest.fn();
jest.mock('app/actions/progress-caller', () => ({
  openNonstopProgress: (...args) => mockOpenNonstopProgress(...args),
  popById: (...args) => mockPopById(...args),
}));

const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();

const mockOnClose = jest.fn();
const mockOnBack = jest.fn();
const mockOnNext = jest.fn();

const mockFishEyeParam: FisheyeCameraParameters = {
  k: [[0]],
  d: [[0]],
  points: [[[[0, 0]]]],
  heights: [0],
  center: [0, 0],
  z3regParam: [[[[0, 0]]]],
};

describe('test Align', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
    mockConnectCamera.mockResolvedValue(undefined);
    mockSetFisheyeMatrix.mockResolvedValue(undefined);
  });

  it('should render correctly', async () => {
    mockTakeOnePicture.mockResolvedValue({ imgBlob: 'blob' });
    mockCreateObjectURL.mockReturnValue('file://url');
    mockEnterRawMode.mockResolvedValue(undefined);
    mockRawGetProbePos.mockResolvedValue({ z: 10, didAf: true });
    mockEndRawMode.mockResolvedValue(undefined);
    const { baseElement } = render(
      <Align
        onClose={mockOnClose}
        onBack={mockOnBack}
        onNext={mockOnNext}
        fisheyeParam={mockFishEyeParam}
      />
    );
    expect(baseElement.querySelector('img').src).toBe('');
    await waitFor(() => {
      expect(baseElement.querySelector('img').src).not.toBe('');
    });
    expect(mockConnectCamera).toBeCalledTimes(1);
    expect(mockInterpolatePointsFromHeight).toBeCalledTimes(1);
    expect(mockInterpolatePointsFromHeight).toHaveBeenLastCalledWith(
      30, mockFishEyeParam.heights, mockFishEyeParam.points
    );
    expect(mockSetFisheyeMatrix).toBeCalledTimes(1);
    expect(mockTakeOnePicture).toBeCalledTimes(1);
    expect(mockCreateObjectURL).toBeCalledTimes(1);
    expect(mockCreateObjectURL).toHaveBeenLastCalledWith('blob');
    expect(baseElement).toMatchSnapshot();
  });

  test('onBack, onClose', async () => {
    mockTakeOnePicture.mockResolvedValue({ imgBlob: 'blob' });
    mockCreateObjectURL.mockReturnValue('file://url');
    const { baseElement, getByText } = render(
      <Align
        onClose={mockOnClose}
        onBack={mockOnBack}
        onNext={mockOnNext}
        fisheyeParam={mockFishEyeParam}
      />
    );
    expect(baseElement.querySelector('img').src).toBe('');
    await waitFor(() => {
      expect(baseElement.querySelector('img').src).not.toBe('');
    });

    expect(mockOnBack).toBeCalledTimes(0);
    fireEvent.click(getByText('back'));
    expect(mockOnBack).toBeCalledTimes(1);
  });

  test('scroll and next should work', async () => {
    mockTakeOnePicture.mockResolvedValue({ imgBlob: 'blob' });
    mockCreateObjectURL.mockReturnValue('file://url');
    const { baseElement, getByText } = render(
      <Align
        onClose={mockOnClose}
        onBack={mockOnBack}
        onNext={mockOnNext}
        fisheyeParam={mockFishEyeParam}
      />
    );
    expect(baseElement.querySelector('img').src).toBe('');
    await waitFor(() => {
      expect(baseElement.querySelector('img').src).not.toBe('');
    });
    expect(mockOpenNonstopProgress).toBeCalledTimes(2);
    expect(mockOpenNonstopProgress).toHaveBeenLastCalledWith({
      id: 'calibration-align', message: 'taking_picture'
    });
    expect(mockPopById).toBeCalledTimes(2);
    expect(mockPopById).toHaveBeenLastCalledWith('calibration-align');
    const img = baseElement.querySelector('img');
    fireEvent.load(img);
    expect(baseElement).toMatchSnapshot();
    const xInput = baseElement.querySelectorAll('input')[0];
    const yInput = baseElement.querySelectorAll('input')[1];
    expect(xInput).toHaveValue(1275);
    expect(yInput).toHaveValue(1050);
    const imgContainer = baseElement.querySelector('.img-container');
    fireEvent.scroll(imgContainer, { target: { scrollLeft: 500, scrollTop: 600 } });
    expect(xInput).toHaveValue(500);
    expect(yInput).toHaveValue(600);
    fireEvent.change(xInput, { target: { value: 100 } });
    expect(imgContainer.scrollLeft).toBe(100);
    fireEvent.click(getByText('next'));
    expect(mockOnNext).toBeCalledTimes(1);
    expect(mockOnNext).toHaveBeenLastCalledWith(100, 600);
  });
});
