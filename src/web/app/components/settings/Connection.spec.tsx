import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  lang: {
    settings: {
      ip: 'Machine IP Address',
      guess_poke: 'Search for machine IP address',
      auto_connect: 'Automatically select the only machine',
      wrong_ip_format: 'Wrong IP Formats',
      groups: {
        connection: 'Connection',
      },
      help_center_urls: {
        connection: 'https://support.flux3dp.com/hc/en-us/sections/360000302135',
      },
    },
  },
}));

const popUp = jest.fn();
jest.mock('app/actions/alert-caller', () => ({
  popUp,
}));

const open = jest.fn();
jest.mock('implementations/browser', () => ({
  open,
}));

const get = jest.fn();
jest.mock('implementations/storage', () => ({
  get,
}));

// eslint-disable-next-line import/first
import Connection from './Connection';

describe('should render correctly', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('invalid ip address is given', () => {
    get.mockReturnValue('192.168.2.2');
    const updateConfigChange = jest.fn();
    const wrapper = shallow(<Connection
      originalIP="192.168.1.1"
      guessingPokeOptions={[
        {
          value: 'TRUE',
          label: 'On',
          selected: true,
        },
        {
          value: 'FALSE',
          label: 'Off',
          selected: false,
        },
      ]}
      autoConnectOptions={[
        {
          value: 'TRUE',
          label: 'On',
          selected: false,
        },
        {
          value: 'FALSE',
          label: 'Off',
          selected: true,
        },
      ]}
      updateConfigChange={updateConfigChange}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenNthCalledWith(1, 'poke-ip-addr');

    wrapper.find('input').simulate('blur', {
      currentTarget: {
        value: '192.168.3.3;192.168.4.4;192.168.1111.111',
      },
    });
    expect(popUp).toHaveBeenCalledTimes(1);
    expect(popUp).toHaveBeenNthCalledWith(1, {
      id: 'wrong-ip-error',
      type: 'SHOW_POPUP_ERROR',
      message: 'Wrong IP Formats\n192.168.1111.111',
    });
    expect(updateConfigChange).not.toHaveBeenCalled();

    wrapper.find('img').simulate('click');
    expect(open).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenNthCalledWith(1, 'https://support.flux3dp.com/hc/en-us/sections/360000302135');

    wrapper.find('SelectControl').at(0).simulate('change', {
      target: {
        value: 'FALSE',
      },
    });
    expect(updateConfigChange).toHaveBeenCalledTimes(1);
    expect(updateConfigChange).toHaveBeenNthCalledWith(1, 'guessing_poke', 'FALSE');

    wrapper.find('SelectControl').at(1).simulate('change', {
      target: {
        value: 'TRUE',
      },
    });
    expect(updateConfigChange).toHaveBeenCalledTimes(2);
    expect(updateConfigChange).toHaveBeenNthCalledWith(2, 'auto_connect', 'TRUE');
  });

  test('valid ip address is given', () => {
    get.mockReturnValue('192.168.2.2');
    const updateConfigChange = jest.fn();
    const wrapper = shallow(<Connection
      originalIP="192.168.1.1"
      guessingPokeOptions={[
        {
          value: 'TRUE',
          label: 'On',
          selected: true,
        },
        {
          value: 'FALSE',
          label: 'Off',
          selected: false,
        },
      ]}
      autoConnectOptions={[
        {
          value: 'TRUE',
          label: 'On',
          selected: false,
        },
        {
          value: 'FALSE',
          label: 'Off',
          selected: true,
        },
      ]}
      updateConfigChange={updateConfigChange}
    />);

    wrapper.find('input').simulate('blur', {
      currentTarget: {
        value: '192.168.3.3;192.168.4.4',
      },
    });
    expect(popUp).not.toHaveBeenCalled();
    expect(updateConfigChange).toHaveBeenCalledTimes(1);
    expect(updateConfigChange).toHaveBeenNthCalledWith(1, 'poke-ip-addr', '192.168.3.3;192.168.4.4');
  });
});
