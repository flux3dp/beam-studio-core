import React from 'react';
import { render } from '@testing-library/react';

import ConnectUsb from './ConnectUsb';

jest.mock('helpers/useI18n', () => () => ({
  initialize: {
    connect_usb: {
      title: 'USB Connection',
      title_sub: ' (HEXA & Ador Only)',
      tutorial1: 'Connect the machine with your computer with USB cable.',
      tutorial2: 'Click Next.',
      turn_off_machine: 'Turn off the machine.',
      turn_on_machine: 'Turn on the machine.',
      wait_for_turning_on: 'Wait for the machine to turn on.',
    },
    next: 'Next',
    back: 'Back',
  },
}));

describe('test ConnectUsb', () => {
  test('should render correctly', () => {
    const { container } = render(<ConnectUsb />);
    expect(container).toMatchSnapshot();
  });
});
