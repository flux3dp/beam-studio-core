import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

import ShowablePasswordInput from './ShowablePasswordInput';

describe('test ShowablePasswordInput', () => {
  test('should render correctly', () => {
    const wrapper = shallow(<ShowablePasswordInput
      id="password-input"
      placeholder="Password"
    />);
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('img').simulate('click');
    expect(toJson(wrapper)).toMatchSnapshot();

    const mockStopPropagation = jest.fn();
    wrapper.find('input#password-input').simulate('keyDown', {
      stopPropagation: mockStopPropagation,
    });
    expect(mockStopPropagation).toHaveBeenCalledTimes(1);
  });
});
