import * as React from 'react';
import { mount, shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const open = jest.fn();
jest.mock('implementations/browser', () => ({
  open,
}));

// eslint-disable-next-line import/first
import Control from './Control';

test('should render correctly', () => {
  expect(toJson(shallow(<Control
    label="Flux"
    children={<div>Hello World</div>}
  />))).toMatchSnapshot();

  const wrapper = mount(<Control
    label="Flux"
    url="https://www.flux3dp.com"
    warningText="Warning!!"
    children={<div>Hello World</div>}
  />);
  expect(toJson(wrapper)).toMatchSnapshot();

  wrapper.find('img').at(0).simulate('click');
  expect(open).toHaveBeenCalledTimes(1);
  expect(open).toHaveBeenNthCalledWith(1, 'https://www.flux3dp.com');
});
