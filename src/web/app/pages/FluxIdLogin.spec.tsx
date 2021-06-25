/* eslint-disable import/first */
import * as React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

const mockShowLoginDialog = jest.fn();
jest.mock('app/actions/dialog-caller', () => ({
  showLoginDialog: mockShowLoginDialog,
}));

import FluxIdLogin from './FluxIdLogin';

test('should render correctly', () => {
  const wrapper = mount(<FluxIdLogin />);
  expect(toJson(wrapper)).toMatchSnapshot();
  expect(mockShowLoginDialog).toHaveBeenCalledTimes(1);
});
