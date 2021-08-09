import { signInWithGoogleCode } from 'helpers/api/flux-id';

function GoogleAuth(): JSX.Element {
  const [_, ...params] = window.location.hash.split('?');
  const [codeParam, redirectdUrlParam] = params.join('?').split('&');
  signInWithGoogleCode({
    code: codeParam.split('=')[1],
    redirect_url: [redirectdUrlParam.split('=')[1], redirectdUrlParam.split('=')[2]].join('='),
  }).then((result) => {
    if (result) {
      if (window.opener.location.hash === '#/initialize/connect/flux-id-login') {
        window.opener.location.hash = '#initialize/connect/select-connection-type';
      } else {
        window.opener.dispatchEvent(new CustomEvent('DISMISS_FLUX_LOGIN'));
      }
      window.close();
    }
  });
  return null;
}

export default GoogleAuth;
