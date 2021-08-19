jest.mock('helpers/i18n', () => ({
  lang: {
    beambox: {
      rating_panel: {
        title: 'Enjoy Beam Studio?',
        description: 'If you like Beam Studio, we would greatly appreciate it if you could rate us.',
        dont_show_again: 'Don\'t Show this next time.',
        thank_you: 'Thank You!',
      },
    },
  },
}));

const mockSetNotShowing = jest.fn();
jest.mock('helpers/rating-helper', () => ({
  setNotShowing: mockSetNotShowing,
}));

import * as React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

import RatingPanel from './RatingPanel';

test('should render correctly', () => {
  const onClose = jest.fn();
  const onSubmit = jest.fn();
  const wrapper = mount(<RatingPanel
    onClose={onClose}
    onSubmit={onSubmit}
  />);
  expect(toJson(wrapper)).toMatchSnapshot();

  [1, 2, 3, 4, 5].forEach((index) => {
    wrapper.find('img').at(index).simulate('mouseEnter');
    expect(wrapper.state().tempStar).toBe(index);
    expect(toJson(wrapper)).toMatchSnapshot();
    wrapper.find('img').at(index).simulate('mouseLeave');
    expect(wrapper.state().tempStar).toBe(0);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  [1, 2, 3, 4, 5].forEach((index) => {
    wrapper.find('img').at(index).simulate('click');
    expect(wrapper.state().star).toBe(index);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  expect(wrapper.state().checkboxChecked).toBeFalsy();
  wrapper.find('button.secondary').simulate('click');
  expect(mockSetNotShowing).not.toHaveBeenCalled();
  expect(onClose).toHaveBeenCalledTimes(1);

  wrapper.find('div.modal-checkbox').simulate('click');
  expect(wrapper.state().checkboxChecked).toBeTruthy();
  wrapper.find('button.secondary').simulate('click');
  expect(mockSetNotShowing).toHaveBeenCalledTimes(1);
  expect(onClose).toHaveBeenCalledTimes(2);

  expect(wrapper.state().isFinished).toBeFalsy();
  wrapper.find('button.primary').simulate('click');
  expect(wrapper.state().isFinished).toBeTruthy();
  expect(onSubmit).toHaveBeenNthCalledWith(1, 5);
});
