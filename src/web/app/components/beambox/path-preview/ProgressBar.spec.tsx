import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

import ProgressBar from './ProgressBar';

test('should render correctly', () => {
  const handleSimTimeChange = jest.fn();
  const wrapper = shallow(<ProgressBar
    simTime={0.5}
    simTimeMax={1}
    handleSimTimeChange={handleSimTimeChange}
  />);
  expect(toJson(wrapper)).toMatchSnapshot();

  wrapper.find('input.slider').simulate('change', {
    target: { value: 0.7 },
  });
  expect(handleSimTimeChange).toHaveBeenCalledTimes(1);
  expect(handleSimTimeChange).toHaveBeenNthCalledWith(1, 0.000011666666666666666);
});
