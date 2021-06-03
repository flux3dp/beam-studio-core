const mockShowLoginDialog = jest.fn();
jest.mock('app/actions/dialog-caller', () => ({
  showLoginDialog: mockShowLoginDialog,
}));

import * as React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

import fluxIdLogin from './FluxIdLogin';

test('should render correctly', () => {
  const FluxIdLogin = fluxIdLogin();
  const wrapper = mount(<FluxIdLogin />);
  expect(toJson(wrapper)).toMatchSnapshot();
  expect(mockShowLoginDialog).toHaveBeenCalledTimes(1);
});
