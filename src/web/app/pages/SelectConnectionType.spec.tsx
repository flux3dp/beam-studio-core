import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import SelectConnectionType from './SelectConnectionType';

const mockShowLoadingWindow = jest.fn();
jest.mock('app/actions/dialog-caller', () => ({
  showLoadingWindow: (...args) => mockShowLoadingWindow(...args),
}));

const mockGet = jest.fn();
const mockSet = jest.fn();
jest.mock('implementations/storage', () => ({
  get: (...args) => mockGet(...args),
  set: (...args) => mockSet(...args),
}));

jest.mock('helpers/i18n', () => ({
  lang: {
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
      skip: 'Skip',
      cancel: 'Cancel',
    },
  },
}));

const mockWindowLocationReload = jest.fn();
jest.mock('app/actions/windowLocation', () => () => mockWindowLocationReload());

describe('test SelectConnectionType', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('should render correctly with new user', () => {
    mockGet.mockReturnValue(false);

    const { container, getByText } = render(<SelectConnectionType />);
    expect(container).toMatchSnapshot();
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenNthCalledWith(1, 'printer-is-ready');
    expect(mockSet).not.toHaveBeenCalled();

    fireEvent.click(getByText('Wi-Fi'));
    expect(window.location.hash).toBe('#initialize/connect/connect-wi-fi');

    fireEvent.click(getByText('Wired Network'));
    expect(window.location.hash).toBe('#initialize/connect/connect-wired');

    fireEvent.click(getByText('Direct Connection'));
    expect(window.location.hash).toBe('#initialize/connect/connect-ethernet');

    fireEvent.click(getByText('USB Connection'));
    expect(window.location.hash).toBe('#initialize/connect/connect-usb');

    fireEvent.click(getByText('Skip'));
    expect(mockSet).toHaveBeenCalledTimes(2);
    expect(mockSet).toHaveBeenNthCalledWith(1, 'new-user', true);
    expect(mockSet).toHaveBeenNthCalledWith(2, 'printer-is-ready', true);
    expect(mockShowLoadingWindow).toHaveBeenCalledTimes(1);
    expect(container).toMatchSnapshot();
    expect(window.location.hash).toBe('#studio/beambox');
    expect(mockWindowLocationReload).toHaveBeenCalled();
  });

  test('should render correctly but not new user', () => {
    mockGet.mockReturnValue(true);

    const { container, getByText } = render(<SelectConnectionType />);
    expect(container).toMatchSnapshot();
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenNthCalledWith(1, 'printer-is-ready');
    expect(mockSet).not.toHaveBeenCalled();

    fireEvent.click(getByText('Cancel'));
    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(mockSet).toHaveBeenNthCalledWith(1, 'printer-is-ready', true);
  });
});
