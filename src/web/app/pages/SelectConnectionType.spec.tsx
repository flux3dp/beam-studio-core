import * as React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

const mockShowLoadingWindow = jest.fn();
jest.mock('app/actions/dialog-caller', () => ({
  showLoadingWindow: mockShowLoadingWindow,
}));

const mockGet = jest.fn();
const mockSet = jest.fn();
jest.mock('implementations/storage', () => ({
  get: mockGet,
  set: mockSet,
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
jest.mock('app/actions/windowLocation', () => mockWindowLocationReload);

// eslint-disable-next-line import/first
import SelectConnectionType from './SelectConnectionType';

describe('test Select-Connection-Type', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('should render correctly with new user', () => {
    mockGet.mockReturnValue(false);

    const wrapper = mount(<SelectConnectionType />);
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenNthCalledWith(1, 'printer-is-ready');
    expect(mockSet).not.toHaveBeenCalled();

    wrapper.find('.btn-action').at(0).simulate('click');
    expect(window.location.hash).toBe('#initialize/connect/connect-wi-fi');

    wrapper.find('.btn-action').at(1).simulate('click');
    expect(window.location.hash).toBe('#initialize/connect/connect-wired');

    wrapper.find('.btn-action').at(2).simulate('click');
    expect(window.location.hash).toBe('#initialize/connect/connect-ethernet');

    wrapper.find('.btn-action').at(3).simulate('click');
    expect(window.location.hash).toBe('#initialize/connect/connect-usb');

    wrapper.find('.btn-page').simulate('click');
    expect(mockSet).toHaveBeenCalledTimes(2);
    expect(mockSet).toHaveBeenNthCalledWith(1, 'new-user', true);
    expect(mockSet).toHaveBeenNthCalledWith(2, 'printer-is-ready', true);
    expect(mockShowLoadingWindow).toHaveBeenCalledTimes(1);
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(window.location.hash).toBe('#studio/beambox');
    expect(mockWindowLocationReload).toHaveBeenCalled();
  });

  test('should render correctly but not new user', () => {
    mockGet.mockReturnValue(true);

    const wrapper = mount(<SelectConnectionType />);
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenNthCalledWith(1, 'printer-is-ready');
    expect(mockSet).not.toHaveBeenCalled();

    wrapper.find('.btn-page').simulate('click');
    expect(mockSet).toHaveBeenCalledTimes(1);
    expect(mockSet).toHaveBeenNthCalledWith(1, 'printer-is-ready', true);
  });
});
