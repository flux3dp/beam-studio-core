import React from 'react';
import { render } from '@testing-library/react';

import ConnectUsb from './ConnectUsb';

jest.mock('helpers/i18n', () => ({
  lang: {
    initialize: {
      connect_usb: {
        title: 'USB Connection',
        title_sub: ' (HEXA Only)',
        tutorial1: '1. Connect the machine with your computer with USB cable.',
        tutorial2: '2. Click Next.',
      },
      next: 'Next',
      back: 'Back',
    },
  },
}));

describe('test ConnectUsb', () => {
  test('should render correctly', () => {
    const { container } = render(<ConnectUsb />);
    expect(container).toMatchSnapshot();
  });
});
