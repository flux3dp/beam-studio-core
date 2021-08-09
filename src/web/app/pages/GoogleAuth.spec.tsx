/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const socialAuth = jest.fn();
jest.mock('helpers/social-auth', () => socialAuth);

const signInWithGoogleCode = jest.fn();
jest.mock('helpers/api/flux-id', () => ({
  signInWithGoogleCode,
}));

import GoogleAuth from './GoogleAuth';

test('should render correctly', async () => {
  signInWithGoogleCode.mockResolvedValue(true);
  window.location.hash = '#/google-auth?code=4/0AX4XfWhjY6oc1K0NJKzWnD0FayFqaSqjNMuAjcsCYSopozsP3pZ-ImYrVG_fvBAKnr_y3Q&redirect_url=https://store.flux3dp.com/beam-studio-oauth?isWeb=true';
  const wrapper = await shallow(<GoogleAuth />);

  expect(signInWithGoogleCode).toHaveBeenCalledTimes(1);
  expect(signInWithGoogleCode).toHaveBeenNthCalledWith(1, {
    code: '4/0AX4XfWhjY6oc1K0NJKzWnD0FayFqaSqjNMuAjcsCYSopozsP3pZ-ImYrVG_fvBAKnr_y3Q',
    redirect_url: 'https://store.flux3dp.com/beam-studio-oauth?isWeb=true',
  });
  expect(socialAuth).toHaveBeenCalledTimes(1);
  expect(socialAuth).toHaveBeenNthCalledWith(1, true);
  expect(toJson(wrapper)).toMatchSnapshot();
});
