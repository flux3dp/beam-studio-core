/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

import NestGAPanel from './NestGAPanel';

test('should render correctly', () => {
  const updateNestOptions = jest.fn();
  const wrapper = shallow(<NestGAPanel
    nestOptions={{
      generations: 3,
      population: 10,
    }}
    updateNestOptions={updateNestOptions}
  />);
  expect(toJson(wrapper)).toMatchSnapshot();

  wrapper.find('UnitInput').at(0).props().getValue(2);
  expect(updateNestOptions).toHaveBeenCalledTimes(1);
  expect(updateNestOptions).toHaveBeenNthCalledWith(1, { generations: 2 });
  expect(toJson(wrapper)).toMatchSnapshot();

  wrapper.find('UnitInput').at(1).props().getValue(9);
  expect(updateNestOptions).toHaveBeenCalledTimes(2);
  expect(updateNestOptions).toHaveBeenNthCalledWith(2, { population: 9 });
  expect(toJson(wrapper)).toMatchSnapshot();
});
