import * as React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

const mockOpen = jest.fn();
jest.mock('implementations/browser', () => ({
  open: mockOpen,
}));

jest.mock('helpers/i18n', () => ({
  lang: {
    initialize: {
      connect_ethernet: {
        title: 'Direct Connection',
        tutorial1: '1. Connect the machine with your computer with ethernet cable.',
        tutorial2_1: '2. Follow ',
        tutorial2_a_text: 'this guide',
        tutorial2_a_href_mac: 'https://support.flux3dp.com/hc/en-us/articles/360001517076',
        tutorial2_a_href_win: 'https://support.flux3dp.com/hc/en-us/articles/360001507715',
        tutorial2_2: ' to make your comuter as a router.',
        tutorial3: '3. Click Next.',
      },
      next: 'Next',
      back: 'Back',
    },
  },
}));

// eslint-disable-next-line import/first
import ConnectEthernet from './ConnectEthernet';

describe('test Connect-Ethernet', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('should render correctly in mac', () => {
    Object.defineProperty(window, 'os', {
      value: 'MacOS',
    });
    const wrapper = mount(<ConnectEthernet />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('span').simulate('click');
    expect(mockOpen).toHaveBeenCalledTimes(1);
    expect(mockOpen).toHaveBeenNthCalledWith(1, 'https://support.flux3dp.com/hc/en-us/articles/360001517076');
  });

  test('should render correctly in win', () => {
    Object.defineProperty(window, 'os', {
      value: 'Windows',
    });
    const wrapper = mount(<ConnectEthernet />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('span').simulate('click');
    expect(mockOpen).toHaveBeenCalledTimes(1);
    expect(mockOpen).toHaveBeenNthCalledWith(1, 'https://support.flux3dp.com/hc/en-us/articles/360001507715');
  });
});
