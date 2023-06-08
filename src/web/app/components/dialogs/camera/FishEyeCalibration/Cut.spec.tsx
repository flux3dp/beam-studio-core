import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import Cut from './Cut';

const mockDoAdorCalibrationCut = jest.fn();
jest.mock('helpers/device-master', () => ({
  doAdorCalibrationCut: () => mockDoAdorCalibrationCut(),
}));

const mockOpenNonstopProgress = jest.fn();
const mockPopById = jest.fn();
jest.mock('app/actions/progress-caller', () => ({
  openNonstopProgress: (...args) => mockOpenNonstopProgress(...args),
  popById: (id) => mockPopById(id),
}));

jest.mock('helpers/useI18n', () => () => ({
  buttons: {
    back: 'back',
    next: 'next',
  },
}));

const mockOnClose = jest.fn();
const mockOnBack = jest.fn();
const mockOnNext = jest.fn();

describe('test Cut', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    const { baseElement } = render(<Cut onClose={mockOnClose} onBack={mockOnBack} onNext={mockOnNext} />);
    expect(baseElement).toMatchSnapshot();
  });

  test('onBack should work', () => {
    const { getByText } = render(<Cut onClose={mockOnClose} onBack={mockOnBack} onNext={mockOnNext} />);
    expect(mockOnBack).not.toBeCalled();
    fireEvent.click(getByText('back'));
    expect(mockOnBack).toBeCalledTimes(1);
  });

  test('onNext should work', async () => {
    const { getByText } = render(<Cut onClose={mockOnClose} onBack={mockOnBack} onNext={mockOnNext} />);
    expect(mockOpenNonstopProgress).not.toBeCalled();
    expect(mockDoAdorCalibrationCut).not.toBeCalled();
    mockDoAdorCalibrationCut.mockResolvedValueOnce(null);
    fireEvent.click(getByText('next'));
    expect(mockOpenNonstopProgress).toBeCalledTimes(1);
    expect(mockDoAdorCalibrationCut).toBeCalledTimes(1);

    expect(mockPopById).not.toBeCalled();
    expect(mockOnNext).not.toBeCalled();
    await new Promise((r) => setTimeout(r));
    expect(mockPopById).toBeCalledTimes(1);
    expect(mockOnNext).toBeCalledTimes(1);
  });
});
