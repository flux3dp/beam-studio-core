/* eslint-disable import/first */
import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const signInWithGoogleCode = jest.fn();
jest.mock('helpers/api/flux-id', () => ({
  signInWithGoogleCode,
}));

import GoogleAuth from './GoogleAuth';

describe('should render correctly', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    Object.defineProperty(window, 'opener', { value: {}, writable: true });
    Object.defineProperty(window.opener, 'location', { value: {}, writable: true });
    window.location.hash = '#/google-auth?code=4/0AX4XfWhjY6oc1K0NJKzWnD0FayFqaSqjNMuAjcsCYSopozsP3pZ-ImYrVG_fvBAKnr_y3Q&redirect_url=https://store.flux3dp.com/beam-studio-oauth?isWeb=true';
  });

  test('in initialization page', async () => {
    signInWithGoogleCode.mockResolvedValue(true);
    window.opener.location.hash = '#/initialize/connect/flux-id-login';
    window.opener.dispatchEvent = jest.fn();
    window.close = jest.fn();
    const wrapper = await shallow(<GoogleAuth />);

    expect(signInWithGoogleCode).toHaveBeenCalledTimes(1);
    expect(signInWithGoogleCode).toHaveBeenNthCalledWith(1, {
      code: '4/0AX4XfWhjY6oc1K0NJKzWnD0FayFqaSqjNMuAjcsCYSopozsP3pZ-ImYrVG_fvBAKnr_y3Q',
      redirect_url: 'https://store.flux3dp.com/beam-studio-oauth?isWeb=true',
    });
    expect(window.opener.location.hash).toBe('#initialize/connect/select-connection-type');
    expect(window.opener.dispatchEvent).not.toHaveBeenCalled();
    expect(window.close).toHaveBeenCalledTimes(1);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('from menu', async () => {
    signInWithGoogleCode.mockResolvedValue(true);
    window.opener.location.hash = '#/studio/beambox';
    window.opener.dispatchEvent = jest.fn();
    await shallow(<GoogleAuth />);

    expect(window.opener.location.hash).toBe('#/studio/beambox');
    expect(window.opener.dispatchEvent).toHaveBeenCalledTimes(1);
  });

  test('failed to signin', async () => {
    signInWithGoogleCode.mockResolvedValue(false);
    window.opener.dispatchEvent = jest.fn();
    window.close = jest.fn();
    await shallow(<GoogleAuth />);

    expect(window.opener.dispatchEvent).not.toHaveBeenCalled();
    expect(window.close).not.toHaveBeenCalled();
  });
});
