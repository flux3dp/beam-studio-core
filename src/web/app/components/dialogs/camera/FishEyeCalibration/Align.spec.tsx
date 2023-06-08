import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react';

import Align from './Align';

const mockPopUpError = jest.fn();
jest.mock('app/actions/alert-caller', () => ({
  popUpError: (...args) => mockPopUpError(...args),
}));

const mockSetFisheyeParam = jest.fn();
const mockTakeOnePicture = jest.fn();
const mockConnectCamera = jest.fn();
const mockDisconnectCamera = jest.fn();
jest.mock('helpers/device-master', () => ({
  setFisheyeParam: (...args) => mockSetFisheyeParam(...args),
  takeOnePicture: (...args) => mockTakeOnePicture(...args),
  connectCamera: (...args) => mockConnectCamera(...args),
  disconnectCamera: (...args) => mockDisconnectCamera(...args),
}));

jest.mock('helpers/useI18n', () => () => ({
  buttons: {
    back: 'back',
    next: 'next',
  },
}));

const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();

const mockOnClose = jest.fn();
const mockOnBack = jest.fn();
const mockOnNext = jest.fn();

const mockFishEyeParam = {
  k: [[0]],
  d: [[0]],
  corners: [[0]],
  cx: 0,
  cy: 0,
};

describe('test Align', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
    mockConnectCamera.mockResolvedValue(undefined);
    mockSetFisheyeParam.mockResolvedValue(undefined);
  });

  it('should render correctly', async () => {
    mockTakeOnePicture.mockResolvedValue({ imgBlob: 'blob' });
    mockCreateObjectURL.mockReturnValue('file://url');
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
    expect(mockSetFisheyeParam).toBeCalledTimes(1);
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

    expect(mockOnClose).toBeCalledTimes(0);
    fireEvent.click(baseElement.querySelector('.ant-modal-close-x'));
    expect(mockOnClose).toBeCalledTimes(1);
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
    const img = baseElement.querySelector('img');
    fireEvent.load(img);
    expect(baseElement).toMatchSnapshot();
    const xInput = baseElement.querySelectorAll('input')[0];
    const yInput = baseElement.querySelectorAll('input')[1];
    expect(xInput).toHaveValue(1175);
    expect(yInput).toHaveValue(850);
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
