import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import { IAlert } from 'interfaces/IAlert';

import Alert from './Alert';

const mockPopFromStack = jest.fn();
jest.mock('app/contexts/AlertProgressContext', () => ({
  AlertProgressContext: React.createContext({
    popFromStack: () => mockPopFromStack,
  }),
}));

const mockOnYes = jest.fn();
const mockOnNo = jest.fn();
const mockOnCheckedYes = jest.fn();
const mockOnCheckedNo = jest.fn();

const mockData: IAlert = {
  id: 'alert',
  message: 'Yes or No',
  caption: 'Hello World',
  iconUrl: 'https://www.flux3dp.com/icon.svg',
  buttons: [{
    title: 'Yes',
    label: 'Yes',
    onClick: mockOnYes,
  }, {
    title: 'No',
    label: 'No',
    onClick: mockOnNo,
  }],
  checkbox: {
    text: 'checkbox',
    callbacks: [mockOnCheckedYes, mockOnCheckedNo],
  }
};

describe('test Alert', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    const { baseElement } = render(<Alert data={mockData} />);
    expect(baseElement).toMatchSnapshot();
  });

  test('should call callback when click button', () => {
    const { getByText } = render(<Alert data={mockData} />);
    fireEvent.click(getByText('Yes'));
    expect(mockOnYes).toBeCalledTimes(1);
    fireEvent.click(getByText('No'));
    expect(mockOnNo).toBeCalledTimes(1);
    fireEvent.click(getByText('checkbox'));

    expect(mockOnCheckedYes).not.toBeCalled();
    fireEvent.click(getByText('Yes'));
    expect(mockOnCheckedYes).toBeCalledTimes(1);
    expect(mockOnYes).toBeCalledTimes(1);

    expect(mockOnCheckedNo).not.toBeCalled();
    fireEvent.click(getByText('No'));
    expect(mockOnCheckedNo).toBeCalledTimes(1);
    expect(mockOnNo).toBeCalledTimes(1);
  });
});
