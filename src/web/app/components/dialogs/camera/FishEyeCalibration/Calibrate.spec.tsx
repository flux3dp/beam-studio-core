import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react';

import Calibrate from './Calibrate';

const mockPopUpError = jest.fn();
jest.mock('app/actions/alert-caller', () => ({
  popUpError: (...args) => mockPopUpError(...args),
}));

const mockConnectCamera = jest.fn();
const mockDisconnectCamera = jest.fn();
const mockTakeOnePicture = jest.fn();
jest.mock('helpers/device-master', () => ({
  connectCamera: () => mockConnectCamera(),
  disconnectCamera: () => mockDisconnectCamera(),
  takeOnePicture: () => mockTakeOnePicture(),
}));

jest.mock('helpers/useI18n', () => () => ({
  buttons: {
    next: 'next',
  },
}));

const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();

const mockOnClose = jest.fn();
const mockOnNext = jest.fn();

describe('test Calibrate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
    mockConnectCamera.mockResolvedValue(undefined);
  });

  it('should render correctly', async () => {
    mockTakeOnePicture.mockResolvedValue({ imgBlob: 'blob' });
    mockCreateObjectURL.mockReturnValue('file://url');
    const { baseElement } = render(<Calibrate onClose={mockOnClose} onNext={mockOnNext} />);
    expect(baseElement.querySelector('img').src).toBe('');
    await waitFor(() => {
      expect(baseElement.querySelector('img').src).not.toBe('');
    });
    expect(mockConnectCamera).toBeCalledTimes(1);
    expect(mockTakeOnePicture).toBeCalledTimes(1);
    expect(mockCreateObjectURL).toBeCalledTimes(1);
    expect(mockCreateObjectURL).toHaveBeenLastCalledWith('blob');
    expect(baseElement).toMatchSnapshot();
  });

  test('onClose', async () => {
    mockTakeOnePicture.mockResolvedValue({ imgBlob: 'blob' });
    mockCreateObjectURL.mockReturnValue('file://url');
    const { baseElement } = render(
      <Calibrate onClose={mockOnClose} onNext={mockOnNext} />
    );
    await waitFor(() => {
      expect(baseElement.querySelector('img').src).not.toBe('');
    });

    expect(mockOnClose).toBeCalledTimes(0);
    fireEvent.click(baseElement.querySelector('.ant-modal-close-x'));
    expect(mockOnClose).toBeCalledTimes(1);
  });

  test('take picture should work', async () => {
    mockTakeOnePicture.mockResolvedValueOnce({ imgBlob: 'blob' }).mockResolvedValueOnce({ imgBlob: 'blob2' });
    mockCreateObjectURL.mockReturnValueOnce('file://url').mockReturnValueOnce('file://url2');
    const { baseElement, getByText } = render(
      <Calibrate onClose={mockOnClose} onNext={mockOnNext} />
    );
    await waitFor(() => {
      expect(baseElement.querySelector('img').src).not.toBe('');
    });
    await act(async () => {
      fireEvent.click(getByText('tTake Picture'));
    });
    expect(mockTakeOnePicture).toBeCalledTimes(2);
    expect(mockCreateObjectURL).toBeCalledTimes(2);
    expect(mockCreateObjectURL).toHaveBeenLastCalledWith('blob2');
  });

  test('add picture and next should work', async () => {
    mockTakeOnePicture.mockResolvedValueOnce({ imgBlob: 'blob' }).mockResolvedValueOnce({ imgBlob: 'blob2' });
    mockCreateObjectURL.mockReturnValueOnce('file://url').mockReturnValueOnce('file://url2');
    const { baseElement, getByText } = render(
      <Calibrate onClose={mockOnClose} onNext={mockOnNext} />
    );
    await waitFor(() => {
      expect(baseElement.querySelector('img').src).not.toBe('');
    });
    await act(async () => {
      fireEvent.click(getByText('tAdd Image'));
    });
    expect(mockTakeOnePicture).toBeCalledTimes(2);
    expect(baseElement.querySelectorAll('.container')).toHaveLength(1);

    expect(mockOnNext).toBeCalledTimes(0);
    fireEvent.click(getByText('next'));
    expect(mockOnNext).toBeCalledTimes(1);
  });
});
