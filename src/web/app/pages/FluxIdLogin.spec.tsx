/* eslint-disable import/first */
import * as React from 'react';
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';

const mockClearAllDialogComponents = jest.fn();
const mockShowLoginDialog = jest.fn();
jest.mock('app/actions/dialog-caller', () => ({
  clearAllDialogComponents: mockClearAllDialogComponents,
  showLoginDialog: mockShowLoginDialog,
}));

import FluxIdLogin from './FluxIdLogin';

test('should render correctly', () => {
  const wrapper = mount(<FluxIdLogin />);
  expect(toJson(wrapper)).toMatchSnapshot();
  expect(mockClearAllDialogComponents).toHaveBeenCalledTimes(1);
  expect(mockShowLoginDialog).toHaveBeenCalledTimes(1);
});
