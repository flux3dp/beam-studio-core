import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import Footer from './Footer';

jest.mock('helpers/useI18n', () => () => ({
  beambox: {
    right_panel: {
      laser_panel: {
        delete: 'delete',
        reset: 'reset',
        save_and_exit: 'save_and_exit',
        cancel: 'cancel',
      },
    },
  },
}));

const mockOnClose = jest.fn();
const mockOnDelete = jest.fn();
const mockOnReset = jest.fn();
const mockOnSave = jest.fn();

describe('test Footer', () => {
  it('should render correctly', () => {
    const { container } = render(
      <Footer onClose={mockOnClose} onDelete={mockOnDelete} onReset={mockOnReset} onSave={mockOnSave} />
    );
    expect(container).toMatchSnapshot();
  });

  test('event should be called', () => {
    const { getByText } = render(
      <Footer onClose={mockOnClose} onDelete={mockOnDelete} onReset={mockOnReset} onSave={mockOnSave} />
    );
    expect(mockOnClose).not.toBeCalled();
    fireEvent.click(getByText('cancel'));
    expect(mockOnClose).toBeCalledTimes(1);

    expect(mockOnDelete).not.toBeCalled();
    fireEvent.click(getByText('delete'));
    expect(mockOnDelete).toBeCalledTimes(1);

    expect(mockOnReset).not.toBeCalled();
    fireEvent.click(getByText('reset'));
    expect(mockOnReset).toBeCalledTimes(1);

    expect(mockOnSave).not.toBeCalled();
    fireEvent.click(getByText('save_and_exit'));
    expect(mockOnSave).toBeCalledTimes(1);
  });
});
