import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import Diode from './Diode';

const mockOnToggle = jest.fn();

jest.mock('helpers/useI18n', () => () => ({
  beambox: {
    right_panel: {
      laser_panel: {
        diode: 'diode',
      },
    },
  },
}));

describe('test Diode', () => {
  it('should render correctly', () => {
    const { container } = render(<Diode value onToggle={mockOnToggle} />);
    expect(container).toMatchSnapshot();
  });

  test('onToggle should work', () => {
    const { container } = render(<Diode value onToggle={mockOnToggle} />);
    const div = container.querySelector('.checkbox');
    expect(mockOnToggle).not.toBeCalled();
    fireEvent.click(div);
    expect(mockOnToggle).toBeCalledTimes(1);
  });
});
