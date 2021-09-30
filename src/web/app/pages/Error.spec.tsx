/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

import Error from './Error';

describe('test Error Page', () => {
  test('should render #/error/screen-size correctly', async () => {
    window.location.hash = '#/error/screen-size';
    const wrapper = await shallow(<Error />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('should render unknown error correctly', async () => {
    window.location.hash = '#/error/meaningless-string123';
    const wrapper = await shallow(<Error />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
