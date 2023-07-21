import axios, { AxiosResponse } from 'axios';

import alert from 'app/actions/alert-caller';
import browser from 'implementations/browser';
import communicator from 'implementations/communicator';
import cookies from 'implementations/cookies';
import eventEmitterFactory from 'helpers/eventEmitterFactory';
import i18n from 'helpers/i18n';
import isWeb from 'helpers/is-web';
import parseQueryData from 'helpers/query-data-parser';
import progress from 'app/actions/progress-caller';
import storage from 'implementations/storage';
import { IUser } from 'interfaces/IUser';

export interface ResponseWithError extends AxiosResponse {
  error?: string;
}
const OAUTH_REDIRECT_URI = 'https://store.flux3dp.com/beam-studio-oauth';
const FB_OAUTH_URI = 'https://www.facebook.com/v10.0/dialog/oauth';
const FB_APP_ID = '1071530792957137';
const FB_REDIRECT_URI = `${OAUTH_REDIRECT_URI}${isWeb() ? '?isWeb=true' : ''}`;

const G_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const G_CLIENT_ID = '1071432315622-ekdkc89hdt70sevt6iv9ia4659lg70vi.apps.googleusercontent.com';
const G_REDIRECT_URI = `${OAUTH_REDIRECT_URI}${isWeb() ? '?isWeb=true' : ''}`;

const FLUXID_HOST = 'https://id.flux3dp.com';
const FLUXID_DOMAIN = '.flux3dp.com';
export const axiosFluxId = axios.create({
  baseURL: FLUXID_HOST,
  timeout: 10000,
});

let currentUser: IUser = null;

axiosFluxId.interceptors.response.use((response) => response, (error) => ({ error }));

export const fluxIDEvents = eventEmitterFactory.createEventEmitter('flux-id');

const handleErrorMessage = (error) => {
  if (!error) {
    return;
  }
  const { response } = error;
  if (!response) {
    alert.popUpError({ message: i18n.lang.flux_id_login.connection_fail });
  } else {
    const message = `${response.status} ${response.statusText}`;
    alert.popUpError({ message });
  }
};

const updateMenu = (info?) => {
  communicator.send('UPDATE_ACCOUNT', info);
};

const updateUser = (info?, isWebSocialSignIn = false) => {
  if (info) {
    if (!currentUser) {
      updateMenu(info);
      currentUser = {
        email: info.email,
        info,
      };
      if (isWebSocialSignIn && isWeb()) {
        window.opener.dispatchEvent(new CustomEvent('update-user', {
          detail: {
            user: currentUser,
          },
        }));
      }
    } else {
      if (currentUser.email !== info.email) {
        updateMenu(info);
      }
      Object.assign(currentUser.info, info);
    }
    fluxIDEvents.emit('update-user', currentUser);
  } else {
    if (currentUser) {
      currentUser = null;
      updateMenu();
    }
    fluxIDEvents.emit('update-user', null);
  }
};

window.addEventListener('update-user', (e: CustomEvent) => {
  currentUser = e.detail.user;
});

export const getCurrentUser = (): IUser => currentUser;

const handleOAuthLoginSuccess = (data) => {
  updateUser(data, true);
  fluxIDEvents.emit('oauth-logged-in');
  if (window.location.hash === '#/initialize/connect/flux-id-login') {
    window.location.hash = '#initialize/connect/select-connection-type';
  } else {
    alert.popUp({ message: i18n.lang.flux_id_login.login_success });
  }
};

export const signInWithFBToken = async (fb_token: string): Promise<boolean> => {
  progress.openNonstopProgress({ id: 'flux-id-login' });
  const response = await axiosFluxId.post('/user/signin', { fb_token }, {
    withCredentials: true,
  }) as ResponseWithError;
  progress.popById('flux-id-login');
  if (response.error) {
    handleErrorMessage(response.error);
    return false;
  }

  const { data } = response;
  if (data.status === 'ok') {
    handleOAuthLoginSuccess(data);
    return true;
  }
  const message = data.message ? `${data.info}: ${data.message}` : data.info;
  alert.popUpError({ message });
  return false;
};

export const getInfo = async (silent = false) => {
  const response = await axiosFluxId.get('/user/info', {
    withCredentials: true,
  }) as ResponseWithError;
  if (response.error) {
    if (!silent) {
      handleErrorMessage(response.error);
    }
    return null;
  }
  const responseData = response.data;
  if (response.status === 200) {
    if (responseData.status === 'ok') {
      updateUser(responseData);
    }
    return responseData;
  }
  if (!silent) {
    const message = responseData.message ? `${responseData.info}: ${responseData.message}` : responseData.info;
    alert.popUpError({ message });
  }
  return null;
};

const getAccessToken = async () => {
  const response = await axiosFluxId.get('/oauth/', {
    params: {
      response_type: 'token',
    },
    withCredentials: true,
  }) as ResponseWithError;
  if (response.error) {
    handleErrorMessage(response.error);
    return false;
  }
  const responseData = response.data;
  if (responseData.status === 'ok') {
    return responseData.token;
  }
  const message = responseData.message ? `${responseData.info}: ${responseData.message}` : responseData.info;
  alert.popUpError({ message });
  return null;
};

export const signInWithGoogleCode = async (info: { [key: string]: string }): Promise<boolean> => {
  const data = {
    google_code: info.code,
    redirect_uri: info.redirect_url,
  };
  progress.openNonstopProgress({ id: 'flux-id-login' });
  const response = await axiosFluxId.post('/user/signin', data, {
    withCredentials: true,
  }) as ResponseWithError;
  progress.popById('flux-id-login');

  if (response.error) {
    handleErrorMessage(response.error);
    return false;
  }

  const responseData = response.data;
  if (responseData.status === 'ok') {
    handleOAuthLoginSuccess(responseData);
    return true;
  }
  const message = responseData.message ? `${responseData.info}: ${responseData.message}` : responseData.info;
  alert.popUpError({ message });
  return false;
};

export const signOut = async (): Promise<boolean> => {
  const response = await axiosFluxId.get('/user/logout', {
    withCredentials: true,
  });
  if (response.status === 200) {
    updateUser();
    fluxIDEvents.emit('logged-out');
    return response.data;
  }
  return false;
};

export const init = async (): Promise<void> => {
  axiosFluxId.defaults.withCredentials = true;
  if (!isWeb()) {
    // Set csrf cookie for electron only
    cookies.on('changed', (event, cookie, cause, removed) => {
      if (cookie.domain === FLUXID_DOMAIN && cookie.name === 'csrftoken' && !removed) {
        axiosFluxId.defaults.headers.post['X-CSRFToken'] = cookie.value;
      }
    });
  }
  communicator.on('FB_AUTH_TOKEN', (e, dataString: string) => {
    const data = parseQueryData(dataString);
    const token = data.access_token;
    signInWithFBToken(token);
  });
  communicator.on('GOOGLE_AUTH', (e, dataString: string) => {
    const data = parseQueryData(dataString);
    signInWithGoogleCode(data);
  });
  if (isWeb() || storage.get('keep-flux-id-login') || storage.get('new-user')) {
    // If user is new, keep login status after setting machines.
    if (!isWeb()) {
      // Init csrftoken for electron
      const csrfcookies = await cookies.get({
        domain: FLUXID_DOMAIN,
        name: 'csrftoken',
      });
      if (csrfcookies.length > 0) {
        // Should be unique
        axiosFluxId.defaults.headers.post['X-CSRFToken'] = csrfcookies[0].value;
      }
    }
    const res = await getInfo(true);
    if (res && res.status !== 'ok') {
      updateMenu();
    }
  } else {
    signOut();
    updateMenu();
  }
};

export const externalLinkFBSignIn = (): void => {
  const fbAuthUrl = `${FB_OAUTH_URI}?client_id=${FB_APP_ID}&redirect_uri=${FB_REDIRECT_URI}&response_type=token&scope=email`;
  browser.open(fbAuthUrl);
};

export const externalLinkGoogleSignIn = (): void => {
  const gAuthUrl = `${G_OAUTH_URL}?client_id=${G_CLIENT_ID}&redirect_uri=${G_REDIRECT_URI}&response_type=code&scope=email+profile`;
  browser.open(gAuthUrl);
};

export const externalLinkMemberDashboard = async (): Promise<void> => {
  const token = await getAccessToken();
  if (token) {
    const urlPrefix = i18n.getActiveLang() === 'zh-tw' ? 'tw-' : '';
    const url = `https://${urlPrefix}store.flux3dp.com/api_entry/?feature=beam-studio-login&key=${token}`;
    browser.open(url);
  }
};

export const signIn = async (
  signInData: { email: string, password?: string, fb_token?: string },
) => {
  progress.openNonstopProgress({ id: 'flux-id-login' });
  const response = await axiosFluxId.post('/user/signin', signInData, {
    withCredentials: true,
  }) as ResponseWithError;
  progress.popById('flux-id-login');
  if (response.status === 200) {
    const { data } = response;
    if (data.status === 'ok') {
      updateUser({ email: data.email });
    }
    return data;
  }
  handleErrorMessage(response.error);
  return response;
};

export const submitRating = async (
  ratingData: { user?: string, score: number, version: string, app: string },
) => {
  const response = await axiosFluxId.post('/user_rating/submit_rating', ratingData, {
    withCredentials: true,
  }) as ResponseWithError;

  if (response.status === 200) {
    const { data } = response;
    if (data.status === 'ok') {
      updateUser({ email: data.email });
    }
    return data;
  }

  handleErrorMessage(response.error);
  return response;
};

export const getPreference = async (key = '', silent = false) => {
  const response = await axiosFluxId.get(`software-preference/bxpref/${key}`, {
    withCredentials: true,
  }) as ResponseWithError;

  if (response.status === 200) {
    const { data } = response;
    return data;
  }
  if (!silent) handleErrorMessage(response.error);
  return response;
};

export const setPreference = async (value: { [key: string]: any }): Promise<boolean> => {
  const response = await axiosFluxId.post('software-preference/bxpref', value, {
    withCredentials: true,
  }) as ResponseWithError;
  if (response.status === 200) {
    const { data } = response;
    if (data.status === 'ok') return true;
  }

  return false;
};

export const getNPIconsByTerm = async (term: string, offset = 0) => {
  const response = await axiosFluxId.get(`/api/np/icons/${term}`, {
    params: {
      offset,
    },
    withCredentials: true,
  }) as ResponseWithError;
  if (response.error) {
    handleErrorMessage(response.error);
    return false;
  }

  return response.data;
};

export const getNPIconByID = async (id: string) => {
  const response = await axiosFluxId.get(`/api/np/icon/${id}`, {
    withCredentials: true,
  }) as ResponseWithError;
  if (response.error) {
    handleErrorMessage(response.error);
    return false;
  }
  return response.data;
};

export const getDefaultHeader = () => {
  if (isWeb()) {
    const csrfToken = cookies.getBrowserCookie('csrftoken');
    return {
      'X-CSRFToken': csrfToken,
    };
  }
  return undefined;
};

export default {
  init,
  getPreference,
  setPreference,
};
