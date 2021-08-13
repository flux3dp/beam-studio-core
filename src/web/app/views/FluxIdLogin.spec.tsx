import * as React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';

const popUpError = jest.fn();
const popUp = jest.fn();
jest.mock('app/actions/alert-caller', () => ({
  popUpError,
  popUp,
}));

const open = jest.fn();
jest.mock('implementations/browser', () => ({
  open,
}));

jest.mock('helpers/i18n', () => ({
  lang: {
    flux_id_login: {
      connection_fail: '#847 Failed to connect to FLUX member service.',
      login_success: 'Successfully logged in.',
      login: 'Login',
      unlock_shape_library: 'Login to unlock the shapes database.',
      email: 'Email',
      password: 'Password',
      remember_me: 'Remember me',
      forget_password: 'Forgot Password?',
      register: 'Create Your FLUX Account',
      offline: 'Work Offline',
      work_offline: 'Work Offline',
      incorrect: 'Email address or password is not correct.',
      not_verified: 'The email address has not been verified yet.',
      new_to_flux: 'New to FLUX? Create an account.',
      signup_url: 'https://store.flux3dp.com/my-account/#sign-up',
      lost_password_url: 'https://store.flux3dp.com/my-account/lost-password/',
    },
  },
}));

const get = jest.fn();
const set = jest.fn();
jest.mock('implementations/storage', () => ({
  get,
  set,
}));

const externalLinkFBSignIn = jest.fn();
const externalLinkGoogleSignIn = jest.fn();
const fluxIDEvents = jest.fn();
const signIn = jest.fn();
const signOut = jest.fn();
jest.mock('helpers/api/flux-id', () => ({
  externalLinkFBSignIn,
  externalLinkGoogleSignIn,
  fluxIDEvents,
  signIn,
  signOut,
}));

// eslint-disable-next-line import/first
import FluxIdLogin from './FluxIdLogin';

describe('should render correctly', () => {
  test('desktop version', async () => {
    get.mockReturnValue(false);
    const onClose = jest.fn();
    const wrapper = shallow(<FluxIdLogin
      onClose={onClose}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenNthCalledWith(1, 'keep-flux-id-login');

    wrapper.find('div.facebook').simulate('click');
    expect(externalLinkFBSignIn).toHaveBeenCalledTimes(1);

    wrapper.find('div.google').simulate('click');
    expect(externalLinkGoogleSignIn).toHaveBeenCalledTimes(1);

    wrapper.find('div.remember-me').simulate('click');
    expect(toJson(wrapper)).toMatchSnapshot();

    wrapper.find('div.forget-password').simulate('click');
    expect(open).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenNthCalledWith(1, 'https://store.flux3dp.com/my-account/lost-password/');

    wrapper.find('div.button').at(3).simulate('click');
    expect(open).toHaveBeenCalledTimes(2);
    expect(open).toHaveBeenNthCalledWith(2, 'https://store.flux3dp.com/my-account/#sign-up');

    wrapper.find('div.skip').simulate('click');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('web version', () => {
    window.FLUX.version = 'web';
    const onClose = jest.fn();
    const wrapper = shallow(<FluxIdLogin
      onClose={onClose}
    />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
