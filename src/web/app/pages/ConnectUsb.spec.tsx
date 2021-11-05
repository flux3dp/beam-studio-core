import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

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

// eslint-disable-next-line import/first
import ConnectUsb from './ConnectUsb';

describe('test Connect-Usb', () => {
  test('should render correctly', () => {
    const wrapper = shallow(<ConnectUsb />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
