import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import DialogBox from './Dialog-Box';

test('should render correctly', () => {
  const mockOnClose = jest.fn();
  const wrapper = shallow(<DialogBox
    arrowDirection="top"
    arrowHeight={10}
    arrowWidth={20}
    arrowColor="black"
    arrowPadding={30}
    position={{}}
    onClose={mockOnClose}
    content="Hello World"
  />);
  expect(toJson(wrapper)).toMatchSnapshot();

  wrapper.find('.close-btn').simulate('click');
  expect(mockOnClose).toHaveBeenCalledTimes(1);
});
