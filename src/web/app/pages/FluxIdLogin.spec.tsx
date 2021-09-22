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

const mockGet = jest.fn();
jest.mock('implementations/storage', () => ({
  get: mockGet,
}));

import FluxIdLogin from './FluxIdLogin';

test('should render correctly', () => {
  const wrapper = mount(<FluxIdLogin />);
  expect(toJson(wrapper)).toMatchSnapshot();
  expect(mockClearAllDialogComponents).toHaveBeenCalledTimes(1);
  expect(mockGet).toHaveBeenCalledTimes(1);
  expect(mockGet).toHaveBeenNthCalledWith(1, 'printer-is-ready');
  expect(mockShowLoginDialog).toHaveBeenCalledTimes(1);
});
