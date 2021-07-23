/* eslint-disable import/first */
import * as React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

jest.mock('helpers/i18n', () => ({
  lang: {
    alert: {
      ok2: 'OK',
      cancel: 'Cancel',
    },
  },
}));

import Prompt from './Prompt';

test('should render correctly', () => {
  const onYes = jest.fn();
  const onCancel = jest.fn();
  const onClose = jest.fn();
  const wrapper = mount(<Prompt
    caption="New Preset Name"
    defaultValue=""
    onYes={onYes}
    onCancel={onCancel}
    onClose={onClose}
  />);
  expect(toJson(wrapper)).toMatchSnapshot();

  wrapper.find('input').instance().value = 'Hello';
  wrapper.find('button.btn-default').at(0).simulate('click');
  expect(onYes).toHaveBeenCalledTimes(1);
  expect(onYes).toHaveBeenNthCalledWith(1, 'Hello');
  expect(onClose).toHaveBeenCalledTimes(1);

  jest.resetAllMocks();
  wrapper.find('button.btn-default').at(1).simulate('click');
  expect(onCancel).toHaveBeenCalledTimes(1);
  expect(onCancel).toHaveBeenNthCalledWith(1, 'Hello');
  expect(onClose).toHaveBeenCalledTimes(1);

  jest.resetAllMocks();
  const stopPropagation = jest.fn();
  wrapper.find('input').simulate('keydown', {
    keyCode: 13,
    stopPropagation,
  });
  expect(onYes).toHaveBeenCalledTimes(1);
  expect(onYes).toHaveBeenNthCalledWith(1, 'Hello');
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(stopPropagation).toHaveBeenCalledTimes(1);

  jest.resetAllMocks();
  wrapper.find('input').simulate('keydown', {
    keyCode: 14,
    stopPropagation,
  });
  expect(onYes).not.toHaveBeenCalled();
  expect(onClose).not.toHaveBeenCalled();
  expect(stopPropagation).toHaveBeenCalledTimes(1);
});
