import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import SelectConnectionType from './SelectConnectionType';

const mockShowLoadingWindow = jest.fn();
jest.mock('app/actions/dialog-caller', () => ({
  showLoadingWindow: (...args) => mockShowLoadingWindow(...args),
}));

jest.mock('helpers/useI18n', () => () => ({
    initialize: {
      select_connection_type: 'How do you wish to connect?',
      connection_types: {
        wifi: 'Wi-Fi',
        wired: 'Wired Network',
        ether2ether: 'Direct Connection',
        usb: 'USB Connection',
      },
      connect_usb: {
        title_sub: ' (HEXA Only)',
      },
      back: 'back',
    },
}));

const mockWindowLocationReload = jest.fn();
jest.mock('app/actions/windowLocation', () => () => mockWindowLocationReload());

const mockBack = jest.fn();

describe('test SelectConnectionType', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    window.history.back = mockBack;
    window.location.hash = '?model=ado1'
  });

  test('should render correctly', () => {
    const { container, getByText } = render(<SelectConnectionType />);
    expect(container).toMatchSnapshot();

    fireEvent.click(getByText('Wi-Fi'));
    expect(window.location.hash).toBe('#initialize/connect/connect-wi-fi?model=ado1');

    fireEvent.click(getByText('Wired Network'));
    expect(window.location.hash).toBe('#initialize/connect/connect-wired?model=ado1');

    fireEvent.click(getByText('Direct Connection'));
    expect(window.location.hash).toBe('#initialize/connect/connect-ethernet?model=ado1');

    fireEvent.click(getByText('USB Connection'));
    expect(window.location.hash).toBe('#initialize/connect/connect-usb?model=ado1');

    fireEvent.click(getByText('back'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
