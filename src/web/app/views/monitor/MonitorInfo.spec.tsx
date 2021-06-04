import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

import MonitorInfo from './MonitorInfo';

test('should render correctly', () => {
  const wrapper = shallow(<MonitorInfo
    status="uploading"
    progress="90%"
  />);
  expect(toJson(wrapper)).toMatchSnapshot();
});
